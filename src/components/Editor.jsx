import { useCallback, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import COLORS from "../data/colors";
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

    const match = COLORS.find(
        (color) =>
            color.value.toLowerCase() ===
            normalizedValue
    );

    return match ? match.name : "Personalizado";
};

const formatPatternType = (value) =>
    value === "peyote" ? "Peyote" : value;

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
            setPattern((prev) => {
                const currentColor =
                    prev[row][col];

                const newColor =
                    tool === "eraser"
                        ? null
                        : color;

                if (currentColor === newColor) {
                    return prev;
                }

                const next = prev.map((r) => [...r]);

                next[row][col] = newColor;

                return next;
            });
        },
        [tool, color]
    );

    // --------------------------------------------------
    // FIN DE UNA ACCIÓN DE PINTURA
    // --------------------------------------------------

    const commitCurrentPattern = useCallback(() => {
        setPattern((currentPattern) => {
            commitHistory(
                currentPattern,
                width,
                height
            );

            return currentPattern;
        });
    }, [
        commitHistory,
        width,
        height,
    ]);

    // --------------------------------------------------
    // BALDE
    // --------------------------------------------------

    const fillArea = useCallback(
        (startRow, startCol) => {
            setPattern((prev) => {
                const targetColor =
                    prev[startRow][startCol];

                if (targetColor === color) {
                    return prev;
                }

                const next = prev.map((row) => [
                    ...row,
                ]);

                const queue = [
                    [startRow, startCol],
                ];

                let queueIndex = 0;

                while (queueIndex < queue.length) {
                    const [row, col] =
                        queue[queueIndex++];

                    if (
                        row < 0 ||
                        row >= next.length ||
                        col < 0 ||
                        col >= next[row].length
                    ) {
                        continue;
                    }

                    if (
                        next[row][col] !==
                        targetColor
                    ) {
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

                commitHistory(
                    next,
                    width,
                    height
                );

                return next;
            });
        },
        [
            color,
            commitHistory,
            width,
            height,
        ]
    );

    // --------------------------------------------------
    // AGREGAR COLUMNA
    // --------------------------------------------------

    const addColumn = useCallback(
        (column) => {
            setPattern((prev) => {
                const next = prev.map((row) => {
                    const newRow = [...row];

                    // Nueva columna a la derecha
                    // de la seleccionada.
                    newRow.splice(
                        column + 1,
                        0,
                        null
                    );

                    return newRow;
                });

                const nextWidth = width + 1;

                setWidth(nextWidth);

                commitHistory(
                    next,
                    nextWidth,
                    height
                );

                return next;
            });
        },
        [
            width,
            height,
            commitHistory,
        ]
    );

    // --------------------------------------------------
    // ELIMINAR COLUMNA
    // --------------------------------------------------

    const removeColumn = useCallback(
        (column) => {
            if (width <= 1) return;

            setPattern((prev) => {
                const next = prev.map((row) => {
                    const newRow = [...row];

                    newRow.splice(column, 1);

                    return newRow;
                });

                const nextWidth = width - 1;

                setWidth(nextWidth);

                commitHistory(
                    next,
                    nextWidth,
                    height
                );

                return next;
            });
        },
        [
            width,
            height,
            commitHistory,
        ]
    );

    // --------------------------------------------------
    // AGREGAR FILA
    // --------------------------------------------------

    const addRow = useCallback(
        (row) => {
            setPattern((prev) => {
                const next = [...prev];

                next.splice(
                    row + 1,
                    0,
                    Array(width).fill(null)
                );

                const nextHeight =
                    height + 1;

                setHeight(nextHeight);

                commitHistory(
                    next,
                    width,
                    nextHeight
                );

                return next;
            });
        },
        [
            width,
            height,
            commitHistory,
        ]
    );

    // --------------------------------------------------
    // ELIMINAR FILA
    // --------------------------------------------------

    const removeRow = useCallback(
        (row) => {
            if (height <= 1) return;

            setPattern((prev) => {
                const next = [...prev];

                next.splice(row, 1);

                const nextHeight =
                    height - 1;

                setHeight(nextHeight);

                commitHistory(
                    next,
                    width,
                    nextHeight
                );

                return next;
            });
        },
        [
            width,
            height,
            commitHistory,
        ]
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
    }, [
        resetHistory,
    ]);

    // --------------------------------------------------
    // REDIMENSIONAR
    // --------------------------------------------------

    const resizePattern = useCallback(
        (newWidth, newHeight) => {
            const safeSize = clampPatternSize(newWidth, newHeight);

            if (
                safeSize.width < 1 ||
                safeSize.height < 1
            ) {
                return;
            }

            setPattern((prev) => {
                const next = Array.from(
                    { length: safeSize.height },
                    (_, row) =>
                        Array.from(
                            { length: safeSize.width },
                            (_, col) =>
                                prev[row]?.[col] ??
                                null
                        )
                );

                setWidth(safeSize.width);
                setHeight(safeSize.height);

                commitHistory(
                    next,
                    safeSize.width,
                    safeSize.height
                );

                return next;
            });
        },
        [commitHistory]
    );

    const savePattern = useCallback(async (name) => {
        const beads = pattern.flatMap((row, rowIndex) =>
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
                pattern_type: patternType,
                width,
                height,
                beads,
            },
        });

        setOpenedPattern((current) => current ?? { id: savedId, name });
        return savedId;
    }, [pattern, patternType, width, height, openedPattern]);

    const saveCurrentPattern = useCallback(() => {
        if (!openedPattern) return;

        savePattern(openedPattern.name).catch((error) => {
            console.error("No se pudo actualizar el patrón:", error);
        });
    }, [openedPattern, savePattern]);

    const openPatterns = useCallback(async () => {
        setOpenError("");
        setPatternSearch("");

        try {
            const records = await invoke("list_patterns");
            setSavedPatterns(records);
            setShowOpenDialog(true);
        } catch (error) {
            setOpenError(String(error));
            setShowOpenDialog(true);
        }
    }, []);

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
    }, [resetHistory]);

    const filteredPatterns = savedPatterns.filter((record) => {
        const query = patternSearch.trim().toLowerCase();
        return !query || `${record.name} ${record.pattern_type}`.toLowerCase().includes(query);
    });

    return (
        <div className="flex h-screen flex-col bg-stone-900">
            <ToolSelector
                patternType={patternType}
                setPatternType={setPatternType}

                tool={tool}
                setTool={setTool}

                width={width}
                height={height}
                resizePattern={resizePattern}

                newPattern={newPattern}

                undo={handleUndo}
                redo={handleRedo}

                canUndo={canUndo}
                canRedo={canRedo}
            />

            <div className="flex min-h-0 flex-1 gap-3">
                <PatternSidebar
                    patternType={patternType}
                    setPatternType={setPatternType}
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
                />

                <div className="flex-1 min-w-0">
                    <PatternCanvas
                        width={width}
                        height={height}
                        pattern={pattern}
                        patternType={patternType}
                        patternName={openedPattern?.name}
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
                    onMouseDown={() => setShowOpenDialog(false)}
                >
                    <div
                        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-stone-800 p-6 text-stone-100 shadow-xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">Abrir patrón</h2>
                            <button
                                type="button"
                                onClick={() => setShowOpenDialog(false)}
                                className="text-xl text-stone-300 hover:text-white"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        <input
                            type="search"
                            value={patternSearch}
                            onChange={(event) => setPatternSearch(event.target.value)}
                            placeholder="Buscar por nombre o tipo..."
                            className="mt-4 rounded border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-blue-400"
                        />

                        {openError ? (
                            <p className="mt-4 text-sm text-red-300">{openError}</p>
                        ) : filteredPatterns.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-stone-300">
                                No hay patrones guardados.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-y-auto">
                                {filteredPatterns.map((record) => (
                                    <button
                                        key={record.id}
                                        type="button"
                                        onClick={() => loadPattern(record)}
                                        className="mb-2 flex w-full items-center justify-between rounded border border-stone-700 bg-stone-900/60 px-3 py-3 text-left hover:border-blue-400 hover:bg-stone-700"
                                    >
                                        <span>
                                            <span className="block font-medium">{record.name}</span>
                                            <span className="block text-xs text-stone-400">
                                                {formatPatternType(record.pattern_type)} · {record.width} × {record.height}
                                            </span>
                                        </span>
                                        <span className="text-xs text-stone-400">
                                            {record.beads.length} beads
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;