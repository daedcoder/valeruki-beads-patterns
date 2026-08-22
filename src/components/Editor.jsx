import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import COLORS, { COLOR_BY_VALUE } from "../data/colors";
import { usePatternHistory } from "../hooks/usePatternHistory";
import {
    DEFAULT_PATTERN_HEIGHT,
    DEFAULT_PATTERN_WIDTH,
    clampPatternSize,
} from "../utils/patternSize";

import ColorSidebar from "./ColorSidebar";
import ToolSelector from "./ToolSelector";
import PatternCanvas from "./PatternCanvas";
import PatternSidebar from "./PatternSidebar";

const INITIAL_WIDTH = DEFAULT_PATTERN_WIDTH;
const INITIAL_HEIGHT = DEFAULT_PATTERN_HEIGHT;

const createPattern = (width, height) =>
    Array.from({ length: height }, () =>
        Array.from({ length: width }, () => null)
    );

const findColorName = (value) => {
    if (!value) return "Vacío";

    const normalizedValue =
        typeof value === "string"
            ? value.toLowerCase()
            : "";

    if (!normalizedValue) {
        return "Vacío";
    }

    const match = COLOR_BY_VALUE.get(normalizedValue);
    return match ?? "Personalizado";
};

const formatPatternType = (value) =>
    value === "peyote" ? "Peyote" : value === "telar" ? "Telar" : value;



const Editor = () => {
    const [patternType, setPatternType] = useState("peyote");

    const [color, setColor] = useState(COLORS[0].value);
    const [tool, setTool] = useState("pencil");

    const [width, setWidth] = useState(INITIAL_WIDTH);
    const [height, setHeight] = useState(INITIAL_HEIGHT);

    const [pattern, setPattern] = useState(() =>
        createPattern(INITIAL_WIDTH, INITIAL_HEIGHT)
    );
    const [openedPattern, setOpenedPattern] = useState(null);
    const [savedPatterns, setSavedPatterns] = useState([]);
    const [showOpenDialog, setShowOpenDialog] = useState(false);
    const [patternSearch, setPatternSearch] = useState("");
    const [openError, setOpenError] = useState("");
    const [renamingId, setRenamingId] = useState(null);
    const [renamingValue, setRenamingValue] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Mirror refs: always hold the latest state values so callbacks can read
    // them synchronously without relying on stale closures.
    const patternRef = useRef(pattern);
    const widthRef = useRef(width);
    const heightRef = useRef(height);
    const patternTypeRef = useRef(patternType);

    useEffect(() => { patternRef.current = pattern; }, [pattern]);
    useEffect(() => { widthRef.current = width; }, [width]);
    useEffect(() => { heightRef.current = height; }, [height]);
    useEffect(() => { patternTypeRef.current = patternType; }, [patternType]);

    const pushToast = useCallback((message, variant = "info") => {
        const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const {
        canUndo,
        canRedo,
        commitHistory,
        undo,
        redo,
        resetHistory,
    } = usePatternHistory(
        pattern,
        width,
        height
    );

    const usedColors = useMemo(() => {
        const seen = new Set();

        for (const row of pattern) {
            for (const cell of row) {
                if (cell) {
                    seen.add(cell);
                }
            }
        }

        return Array.from(seen).map((value) => ({
            value,
            name: findColorName(value),
        }));
    }, [pattern]);

    const applySnapshot = useCallback(
        (snapshot) => {
            if (!snapshot) return;

            setPattern(snapshot.pattern);
            setWidth(snapshot.width);
            setHeight(snapshot.height);
            setTool("pencil");
            setIsDirty(true);
        },
        []
    );

    const handleUndo = useCallback(() => {
        const result = undo();
        if (result) {
            applySnapshot(result);
        }
    }, [undo, applySnapshot]);

    const handleRedo = useCallback(() => {
        const result = redo();
        if (result) {
            applySnapshot(result);
        }
    }, [redo, applySnapshot]);

    // --------------------------------------------------
    // PINTAR
    // --------------------------------------------------

    const paint = useCallback(
        (row, col) => {
            const prev = patternRef.current;
            const currentColor = prev[row][col];
            const newColor = tool === "eraser" ? null : color;

            if (currentColor === newColor) {
                return;
            }

            // Clone only the affected row so PatternRow.memo keeps siblings
            // stable and avoids re-rendering the whole canvas.
            const next = [...prev];
            next[row] = [...prev[row]];
            next[row][col] = newColor;

            setPattern(next);
            setIsDirty(true);
        },
        [tool, color]
    );

    // --------------------------------------------------
    // FIN DE UNA ACCIÓN DE PINTURA
    // --------------------------------------------------

    const commitCurrentPattern = useCallback(() => {
        commitHistory(
            patternRef.current,
            widthRef.current,
            heightRef.current
        );
    }, [commitHistory]);

    // --------------------------------------------------
    // BALDE
    // --------------------------------------------------

    const fillArea = useCallback(
        (startRow, startCol) => {
            const prev = patternRef.current;
            const targetColor = prev[startRow][startCol];

            if (targetColor === color) {
                return;
            }

            const next = prev.map((row) => [...row]);

            const queue = [[startRow, startCol]];
            let queueIndex = 0;

            while (queueIndex < queue.length) {
                const [row, col] = queue[queueIndex++];

                if (
                    row < 0 ||
                    row >= next.length ||
                    col < 0 ||
                    col >= next[row].length
                ) {
                    continue;
                }

                if (next[row][col] !== targetColor) {
                    continue;
                }

                next[row][col] = color;

                queue.push(
                    [row - 1, col],
                    [row + 1, col],
                    [row, col - 1],
                    [row, col + 1]
                );
            }

            const currentWidth = widthRef.current;
            const currentHeight = heightRef.current;

            setPattern(next);
            setIsDirty(true);
            commitHistory(next, currentWidth, currentHeight);
        },
        [color, commitHistory]
    );

    // --------------------------------------------------
    // AGREGAR COLUMNA
    // --------------------------------------------------

    const addColumn = useCallback(
        (column) => {
            const prev = patternRef.current;
            const currentHeight = heightRef.current;
            const currentWidth = widthRef.current;

            const next = prev.map((row) => {
                const newRow = [...row];
                newRow.splice(column + 1, 0, null);
                return newRow;
            });

            const nextWidth = currentWidth + 1;

            setPattern(next);
            setWidth(nextWidth);
            setIsDirty(true);
            commitHistory(next, nextWidth, currentHeight);
        },
        [commitHistory]
    );

    // --------------------------------------------------
    // ELIMINAR COLUMNA
    // --------------------------------------------------

    const removeColumn = useCallback(
        (column) => {
            const currentWidth = widthRef.current;
            if (currentWidth <= 1) return;

            const prev = patternRef.current;
            const currentHeight = heightRef.current;

            const next = prev.map((row) => {
                const newRow = [...row];
                newRow.splice(column, 1);
                return newRow;
            });

            const nextWidth = currentWidth - 1;

            setPattern(next);
            setWidth(nextWidth);
            setIsDirty(true);
            commitHistory(next, nextWidth, currentHeight);
        },
        [commitHistory]
    );

    // --------------------------------------------------
    // AGREGAR FILA
    // --------------------------------------------------

    const addRow = useCallback(
        (row) => {
            const prev = patternRef.current;
            const currentWidth = widthRef.current;
            const currentHeight = heightRef.current;

            const next = [...prev];
            next.splice(row + 1, 0, Array(currentWidth).fill(null));

            const nextHeight = currentHeight + 1;

            setPattern(next);
            setHeight(nextHeight);
            setIsDirty(true);
            commitHistory(next, currentWidth, nextHeight);
        },
        [commitHistory]
    );

    // --------------------------------------------------
    // ELIMINAR FILA
    // --------------------------------------------------

    const removeRow = useCallback(
        (row) => {
            const currentHeight = heightRef.current;
            if (currentHeight <= 1) return;

            const prev = patternRef.current;
            const currentWidth = widthRef.current;

            const next = [...prev];
            next.splice(row, 1);

            const nextHeight = currentHeight - 1;

            setPattern(next);
            setHeight(nextHeight);
            setIsDirty(true);
            commitHistory(next, currentWidth, nextHeight);
        },
        [commitHistory]
    );

    // --------------------------------------------------
    // NUEVO
    // --------------------------------------------------

    const newPattern = useCallback(() => {
        const next = createPattern(
            DEFAULT_PATTERN_WIDTH,
            DEFAULT_PATTERN_HEIGHT
        );

        setPattern(next);
        setWidth(DEFAULT_PATTERN_WIDTH);
        setHeight(DEFAULT_PATTERN_HEIGHT);
        setOpenedPattern(null);
        resetHistory(next, DEFAULT_PATTERN_WIDTH, DEFAULT_PATTERN_HEIGHT);
        setTool("pencil");
        setIsDirty(false);
    }, [resetHistory]);

    // --------------------------------------------------
    // REDIMENSIONAR
    // --------------------------------------------------

    const resizePattern = useCallback(
        (newWidth, newHeight) => {
            const safeSize = clampPatternSize(newWidth, newHeight);

            if (safeSize.width < 1 || safeSize.height < 1) {
                return;
            }

            const prev = patternRef.current;
            const next = Array.from(
                { length: safeSize.height },
                (_, row) =>
                    Array.from(
                        { length: safeSize.width },
                        (_, col) => prev[row]?.[col] ?? null
                    )
            );

            const currentWidth = widthRef.current;
            const currentHeight = heightRef.current;

            const changed =
                safeSize.width !== currentWidth ||
                safeSize.height !== currentHeight ||
                next.some((r, ri) =>
                    r.some((c, ci) => c !== prev[ri]?.[ci])
                );

            setPattern(next);
            setWidth(safeSize.width);
            setHeight(safeSize.height);
            commitHistory(next, safeSize.width, safeSize.height);

            if (changed) {
                setIsDirty(true);
            }
        },
        [commitHistory]
    );

    const savePattern = useCallback(async (name) => {
        const currentPattern = patternRef.current;
        const currentWidth = widthRef.current;
        const currentHeight = heightRef.current;
        const currentPatternType = patternTypeRef.current;

        const beads = currentPattern.flatMap((row, rowIndex) =>
            row.flatMap((cell, colIndex) =>
                cell
                    ? [{ row: rowIndex, col: colIndex, color: cell }]
                    : []
            )
        );

        const savedId = await invoke("save_pattern", {
            input: {
                pattern_id: openedPattern?.id ?? null,
                name,
                pattern_type: currentPatternType,
                width: currentWidth,
                height: currentHeight,
                beads,
            },
        });

        setOpenedPattern((current) => current ?? { id: savedId, name });
        setIsDirty(false);
        return savedId;
    }, [openedPattern]);

    const saveCurrentPattern = useCallback(() => {
        if (!openedPattern) return;

        savePattern(openedPattern.name)
            .catch((error) => {
                console.error("No se pudo actualizar el patrón:", error);
                pushToast(
                    "No se pudo guardar el diseño: " + String(error.message || error),
                    "error"
                );
            });
    }, [openedPattern, savePattern, pushToast]);

    const changePatternType = useCallback((nextType) => {
        const current = patternTypeRef.current;
        if (current === nextType) return;
        setPatternType(nextType);
        setIsDirty(true);
    }, []);

    const openPatterns = useCallback(async () => {
        setOpenError("");
        setPatternSearch("");
        setRenamingId(null);
        setRenamingValue("");
        setDeleteTarget(null);

        try {
            const records = await invoke("list_patterns");
            setSavedPatterns(records);
            setShowOpenDialog(true);
        } catch (error) {
            const message = String(error.message || error);
            setOpenError(message);
            pushToast("No se pudieron cargar los diseños", "error");
            setShowOpenDialog(true);
        }
    }, [pushToast]);

    const loadPattern = useCallback((record) => {
        const next = createPattern(record.width, record.height);

        for (const bead of record.beads) {
            if (
                bead.row >= 0 && bead.row < record.height &&
                bead.col >= 0 && bead.col < record.width
            ) {
                next[bead.row][bead.col] = bead.color;
            }
        }

        setPattern(next);
        setWidth(record.width);
        setHeight(record.height);
        setPatternType(record.pattern_type);
        setOpenedPattern({ id: record.id, name: record.name });
        resetHistory(next, record.width, record.height);
        setTool("pencil");
        setShowOpenDialog(false);
        setIsDirty(false);
    }, [resetHistory]);

    const refreshPatterns = useCallback(async () => {
        try {
            const records = await invoke("list_patterns");
            setSavedPatterns(records);
        } catch (error) {
            const message = String(error.message || error);
            setOpenError(message);
            pushToast("No se pudo actualizar la lista de diseños", "error");
        }
    }, [pushToast]);

    const startRenaming = useCallback((record) => {
        setRenamingId(record.id);
        setRenamingValue(record.name);
    }, []);

    const cancelRenaming = useCallback(() => {
        setRenamingId(null);
        setRenamingValue("");
    }, []);

    const commitRenaming = useCallback(async () => {
        if (!renamingId) return;

        const newName = renamingValue.trim();
        if (!newName) {
            setOpenError("El nombre del patrón es obligatorio");
            pushToast("El nombre del patrón es obligatorio", "error");
            return;
        }

        try {
            await invoke("rename_pattern", {
                patternId: renamingId,
                newName: newName,
            });

            setOpenedPattern((current) =>
                current && current.id === renamingId
                    ? { ...current, name: newName }
                    : current
            );

            cancelRenaming();
            await refreshPatterns();
            pushToast("Diseño renombrado correctamente", "success");
        } catch (error) {
            const message = String(error.message || error);
            setOpenError(message);
            pushToast("No se pudo renombrar: " + message, "error");
        }
    }, [renamingId, renamingValue, cancelRenaming, refreshPatterns, pushToast]);

    const requestDelete = useCallback((record) => {
        setDeleteTarget(record);
    }, []);

    const cancelDelete = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        try {
            await invoke("delete_pattern", {
                patternId: deleteTarget.id,
            });

            setOpenedPattern((current) =>
                current && current.id === deleteTarget.id ? null : current
            );

            cancelDelete();
            await refreshPatterns();
            pushToast("Diseño eliminado correctamente", "success");
        } catch (error) {
            const message = String(error.message || error);
            setOpenError(message);
            pushToast("No se pudo eliminar: " + message, "error");
            cancelDelete();
        }
    }, [deleteTarget, cancelDelete, refreshPatterns, pushToast]);

    const filteredPatterns = savedPatterns.filter((record) => {
        const query = patternSearch.trim().toLowerCase();
        return !query || `${record.name} ${record.pattern_type}`.toLowerCase().includes(query);
    });

    return (
        <div className="flex h-screen flex-col bg-stone-900">
            <ToolSelector
                tool={tool}
                setTool={setTool}

                undo={handleUndo}
                redo={handleRedo}

                canUndo={canUndo}
                canRedo={canRedo}
            />

            <div className="flex min-h-0 flex-1 gap-3">
                <PatternSidebar
                    patternType={patternType}
                    setPatternType={changePatternType}
                    width={width}
                    height={height}
                    resizePattern={resizePattern}
                    usedColors={usedColors}
                    color={color}
                    setColor={setColor}
                    setTool={setTool}
                    newPattern={newPattern}
                    savePattern={savePattern}
                    saveCurrentPattern={saveCurrentPattern}
                    openedPattern={openedPattern}
                    openPatterns={openPatterns}
                    isDirty={isDirty}
                />

                <div className="flex-1 min-w-0">
                    <PatternCanvas
                        width={width}
                        height={height}
                        pattern={pattern}
                        patternType={patternType}
                        patternName={openedPattern?.name}
                        isDirty={isDirty}
                        tool={tool}

                        paint={paint}
                        fillArea={fillArea}

                        addColumn={addColumn}
                        removeColumn={removeColumn}

                        addRow={addRow}
                        removeRow={removeRow}

                        commitCurrentPattern={
                            commitCurrentPattern
                        }
                    />
                </div>

                <ColorSidebar
                    color={color}
                    setColor={setColor}
                    setTool={setTool}
                />
            </div>

            {showOpenDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={() => {
                        cancelRenaming();
                        cancelDelete();
                        setShowOpenDialog(false);
                    }}
                >
                    <div
                        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-stone-800 border border-stone-600 p-6 text-stone-100 shadow-xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-semibold uppercase text-sm">Abrir diseño</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    cancelRenaming();
                                    cancelDelete();
                                    setShowOpenDialog(false);
                                }}
                                className="text-xl text-stone-300 hover:text-white"
                                aria-label="Cerrar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <input
                            type="search"
                            value={patternSearch}
                            onChange={(event) => setPatternSearch(event.target.value)}
                            placeholder="Buscar..."
                            className="mt-4 rounded border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-blue-400"
                        />

                        {openError ? (
                            <p className="mt-4 text-sm text-red-300">{openError}</p>
                        ) : filteredPatterns.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-stone-300">
                                No hay diseños guardados.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-y-auto">
                                {filteredPatterns.map((record) => (
                                    <div
                                        key={record.id}
                                        className="mb-2 rounded border border-stone-700 bg-stone-900/60 px-3 py-3 hover:border-stone-500"
                                    >
                                        {renamingId === record.id ? (
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={renamingValue}
                                                    onChange={(event) => setRenamingValue(event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            event.preventDefault();
                                                            commitRenaming();
                                                        } else if (event.key === "Escape") {
                                                            event.preventDefault();
                                                            cancelRenaming();
                                                        }
                                                    }}
                                                    className="w-full rounded border border-blue-400 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={cancelRenaming}
                                                        className="rounded border border-stone-600 bg-stone-800 px-3 py-1 text-xs text-stone-200 hover:bg-stone-700"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={commitRenaming}
                                                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500"
                                                    >
                                                        Guardar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => loadPattern(record)}
                                                    className="flex-1 text-left hover:opacity-90"
                                                >
                                                    <span className="block font-medium uppercase">
                                                        {record.name}
                                                    </span>
                                                    <span className="block text-xs text-stone-400">
                                                        {formatPatternType(record.pattern_type)} · {record.width} × {record.height}
                                                    </span>
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-stone-400 whitespace-nowrap">
                                                        {record.beads.length} beads
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                startRenaming(record);
                                                            }}
                                                            className="rounded p-1.5 text-stone-300 hover:bg-stone-700 hover:text-blue-400"
                                                            aria-label="Renombrar"
                                                            title="Renombrar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                requestDelete(record);
                                                            }}
                                                            className="rounded p-1.5 text-stone-300 hover:bg-stone-700 hover:text-red-400"
                                                            aria-label="Eliminar"
                                                            title="Eliminar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
                    onMouseDown={cancelDelete}
                >
                    <div
                        className="flex w-full max-w-sm flex-col rounded-lg bg-stone-800 border border-stone-600 p-6 text-stone-100 shadow-xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <h3 className="font-semibold uppercase text-sm">
                            Eliminar diseño
                        </h3>
                        <p className="mt-4 text-sm text-stone-300">
                            ¿Estás seguro que deseas eliminar{" "}
                            <span className="font-medium text-stone-100">
                                "{deleteTarget.name}"
                            </span>
                            ? Esta acción no se puede deshacer.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="rounded border border-stone-600 bg-stone-700 px-4 py-2 text-sm text-stone-100 hover:bg-stone-600"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pointer-events-none fixed bottom-4 left-1/2 z-70 flex -translate-x-1/2 flex-col items-center gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto rounded-md border px-4 py-2 text-sm shadow-lg backdrop-blur ${
                            t.variant === "error"
                                ? "border-red-500/50 bg-red-950/90 text-red-100"
                                : t.variant === "success"
                                ? "border-emerald-500/50 bg-emerald-950/90 text-emerald-100"
                                : "border-sky-500/50 bg-sky-950/90 text-sky-100"
                        }`}
                        role={t.variant === "error" ? "alert" : "status"}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Editor;
