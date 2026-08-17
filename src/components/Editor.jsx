import { useCallback, useMemo, useState } from "react";

import COLORS from "../data/colors";
import { usePatternHistory } from "../hooks/usePatternHistory";

import ColorPalette from "./ColorPalette";
import EditorToolbar from "./EditorToolbar";
import PatternCanvas from "./PatternCanvas";

const INITIAL_WIDTH = 50;
const INITIAL_HEIGHT = 40;

const createPattern = (width, height) =>
    Array.from({ length: height }, () =>
        Array.from({ length: width }, () => null)
    );

const findColorName = (value) => {
    if (!value) return "Vacío";

    const match = COLORS.find(
        (color) =>
            color.value.toLowerCase() ===
            value.toLowerCase()
    );

    return match ? match.name : "Personalizado";
};

const Editor = () => {
    const [patternType, setPatternType] = useState("peyote");

    const [color, setColor] = useState(COLORS[0]);
    const [tool, setTool] = useState("pencil");

    const [width, setWidth] = useState(INITIAL_WIDTH);
    const [height, setHeight] = useState(INITIAL_HEIGHT);

    const [pattern, setPattern] = useState(() =>
        createPattern(INITIAL_WIDTH, INITIAL_HEIGHT)
    );

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
            width,
            height
        );

        setPattern(next);
        resetHistory(next, width, height);
        setTool("pencil");
    }, [
        width,
        height,
        resetHistory,
    ]);

    // --------------------------------------------------
    // REDIMENSIONAR
    // --------------------------------------------------

    const resizePattern = useCallback(
        (newWidth, newHeight) => {
            if (
                newWidth < 1 ||
                newHeight < 1
            ) {
                return;
            }

            setPattern((prev) => {
                const next = Array.from(
                    { length: newHeight },
                    (_, row) =>
                        Array.from(
                            { length: newWidth },
                            (_, col) =>
                                prev[row]?.[col] ??
                                null
                        )
                );

                setWidth(newWidth);
                setHeight(newHeight);

                commitHistory(
                    next,
                    newWidth,
                    newHeight
                );

                return next;
            });
        },
        [commitHistory]
    );

    return (
        <div className="flex h-screen flex-col bg-stone-500">
            <EditorToolbar
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

            <div className="flex min-h-0 flex-1 gap-3 p-3">
                <aside className="w-48 shrink-0 rounded-md bg-stone-600 p-3 shadow shadow-stone-800 self-start">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-200">
                        Colores Usados
                    </div>

                    <div className="flex flex-col gap-2">
                        {usedColors.length === 0 ? (
                            <div className="rounded border border-dashed border-stone-500 px-2 py-3 text-center text-xs text-stone-300">
                                Diseña algo para ver los colores aquí.
                            </div>
                        ) : (
                            usedColors.map((item) => {
                                const isSelected = color === item.value;

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setColor(item.value);
                                            setTool("pencil");
                                        }}
                                        className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-sm transition ${
                                            isSelected
                                                ? "border-blue-400 bg-stone-800 text-white"
                                                : "border-stone-600 bg-stone-800/60 text-stone-200 hover:bg-stone-700"
                                        }`}
                                    >
                                        <span
                                            className="h-5 w-5 rounded border border-stone-300"
                                            style={{ backgroundColor: item.value }}
                                            aria-label={item.name}
                                        />
                                        <span className="truncate">
                                            {item.name}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <PatternCanvas
                        width={width}
                        height={height}
                        pattern={pattern}
                        patternType={patternType}
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

                <aside className="w-56 shrink-0 rounded-md bg-stone-600 p-3 shadow shadow-stone-800">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-200">
                        lista de Colores
                    </div>
                    <ColorPalette
                        color={color}
                        setColor={setColor}
                        setTool={setTool}
                    />
                </aside>
            </div>
        </div>
    );
};

export default Editor;