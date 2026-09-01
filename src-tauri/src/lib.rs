use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf};

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
    created_at: String,
}

fn database_path() -> Result<PathBuf, String> {
    let executable_dir = env::current_exe()
        .map_err(|error| format!("No se pudo obtener la ubicación del ejecutable: {error}"))?
        .parent()
        .map(PathBuf::from)
        .ok_or_else(|| "El ejecutable no tiene un directorio padre válido".to_string())?;

    Ok(executable_dir.join("data").join("patterns.db"))
}

fn open_database() -> Result<(Connection, PathBuf), String> {
    let path = database_path()?;

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
fn initialize_database() -> Result<DatabaseStatus, String> {
    let (_, database_path) = open_database()?;

    Ok(DatabaseStatus {
        path: database_path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
fn save_pattern(input: SavePatternInput) -> Result<i64, String> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err("El nombre del patrón es obligatorio".to_string());
    }

    if input.width == 0 || input.height == 0 {
        return Err("El tamaño del patrón debe ser mayor que cero".to_string());
    }

    let cells = serde_json::to_string(&input.beads)
        .map_err(|error| format!("No se pudieron serializar las beads: {error}"))?;
    let (connection, _) = open_database()?;

    let pattern_id = if let Some(pattern_id) = input.pattern_id {
        connection
            .execute(
                "UPDATE patterns
                 SET name = ?1, pattern_type = ?2, width = ?3, height = ?4,
                     cells = ?5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?6",
                rusqlite::params![
                    name,
                    input.pattern_type,
                    input.width,
                    input.height,
                    cells,
                    pattern_id
                ],
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
fn list_patterns() -> Result<Vec<PatternRecord>, String> {
    let (connection, _) = open_database()?;
    let mut statement = connection
        .prepare(
            "SELECT id, name, pattern_type, width, height, cells, created_at
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
                created_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("No se pudieron leer los patrones: {error}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("No se pudo interpretar un patrón guardado: {error}"))?;

    Ok(records)
}

#[tauri::command]
fn rename_pattern(pattern_id: i64, new_name: String) -> Result<(), String> {
    let trimmed_name = new_name.trim();
    if trimmed_name.is_empty() {
        return Err("El nombre del patrón es obligatorio".to_string());
    }

    let (connection, _) = open_database()?;
    connection
        .execute(
            "UPDATE patterns SET name = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
            rusqlite::params![trimmed_name, pattern_id],
        )
        .map_err(|error| format!("No se pudo renombrar el patrón: {error}"))?;

    if connection.changes() == 0 {
        return Err("El patrón que intentas renombrar no existe".to_string());
    }

    Ok(())
}

#[tauri::command]
fn delete_pattern(pattern_id: i64) -> Result<(), String> {
    let (connection, _) = open_database()?;
    connection
        .execute(
            "DELETE FROM patterns WHERE id = ?1",
            rusqlite::params![pattern_id],
        )
        .map_err(|error| format!("No se pudo eliminar el patrón: {error}"))?;

    if connection.changes() == 0 {
        return Err("El patrón que intentas eliminar no existe".to_string());
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            initialize_database,
            save_pattern,
            list_patterns,
            rename_pattern,
            delete_pattern
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
