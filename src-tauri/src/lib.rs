use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct DatabaseStatus {
    path: String,
}

#[derive(Deserialize, Serialize)]
struct BeadData {
    row: usize,
    col: usize,
    color: String,
}

#[derive(Deserialize)]
struct SavePatternInput {
    pattern_id: Option<i64>,
    name: String,
    pattern_type: String,
    width: usize,
    height: usize,
    beads: Vec<BeadData>,
}

#[derive(Serialize)]
struct PatternRecord {
    id: i64,
    name: String,
    pattern_type: String,
    width: usize,
    height: usize,
    beads: Vec<BeadData>,
}

fn database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if cfg!(debug_assertions) {
        return Ok(PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../src/database/patterns.db"));
    }

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("No se pudo obtener el directorio de datos: {error}"))?;

    fs::create_dir_all(&data_dir)
        .map_err(|error| format!("No se pudo crear el directorio de datos: {error}"))?;

    Ok(data_dir.join("patterns.db"))
}

fn open_database(app: &tauri::AppHandle) -> Result<(Connection, PathBuf), String> {
    let path = database_path(app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("No se pudo preparar la base de datos: {error}"))?;
    }

    let connection = Connection::open(&path)
        .map_err(|error| format!("No se pudo abrir la base de datos SQLite: {error}"))?;

    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                pattern_type TEXT NOT NULL,
                width INTEGER NOT NULL CHECK (width > 0),
                height INTEGER NOT NULL CHECK (height > 0),
                cells TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            ",
        )
        .map_err(|error| format!("No se pudo inicializar el esquema SQLite: {error}"))?;

    Ok((connection, path))
}

#[tauri::command]
fn initialize_database(app: tauri::AppHandle) -> Result<DatabaseStatus, String> {
    let (_, database_path) = open_database(&app)?;

    Ok(DatabaseStatus {
        path: database_path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
fn save_pattern(app: tauri::AppHandle, input: SavePatternInput) -> Result<i64, String> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err("El nombre del patrón es obligatorio".to_string());
    }

    if input.width == 0 || input.height == 0 {
        return Err("El tamaño del patrón debe ser mayor que cero".to_string());
    }

    let cells = serde_json::to_string(&input.beads)
        .map_err(|error| format!("No se pudieron serializar las beads: {error}"))?;
    let (connection, _) = open_database(&app)?;

    let pattern_id = if let Some(pattern_id) = input.pattern_id {
        connection
            .execute(
                "UPDATE patterns
                 SET name = ?1, pattern_type = ?2, width = ?3, height = ?4,
                     cells = ?5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?6",
                rusqlite::params![name, input.pattern_type, input.width, input.height, cells, pattern_id],
            )
            .map_err(|error| format!("No se pudo actualizar el patrón: {error}"))?;

        if connection.changes() == 0 {
            return Err("El patrón que intentas actualizar no existe".to_string());
        }

        pattern_id
    } else {
        connection
            .execute(
                "INSERT INTO patterns (name, pattern_type, width, height, cells) VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![name, input.pattern_type, input.width, input.height, cells],
            )
            .map_err(|error| format!("No se pudo guardar el patrón: {error}"))?;

        connection.last_insert_rowid()
    };

    Ok(pattern_id)
}

#[tauri::command]
fn list_patterns(app: tauri::AppHandle) -> Result<Vec<PatternRecord>, String> {
    let (connection, _) = open_database(&app)?;
    let mut statement = connection
        .prepare(
            "SELECT id, name, pattern_type, width, height, cells
             FROM patterns ORDER BY updated_at DESC, id DESC",
        )
        .map_err(|error| format!("No se pudieron consultar los patrones: {error}"))?;

    let records = statement
        .query_map([], |row| {
            let cells: String = row.get(5)?;
            let beads = serde_json::from_str(&cells).map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    cells.len(),
                    rusqlite::types::Type::Text,
                    Box::new(error),
                )
            })?;

            Ok(PatternRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                pattern_type: row.get(2)?,
                width: row.get(3)?,
                height: row.get(4)?,
                beads,
            })
        })
        .map_err(|error| format!("No se pudieron leer los patrones: {error}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("No se pudo interpretar un patrón guardado: {error}"))?;

    Ok(records)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            initialize_database,
            save_pattern,
            list_patterns
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
