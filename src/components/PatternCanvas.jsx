import { useCallback, useRef } from "react";

import { BEAD_HEIGHT, BEAD_WIDTH } from "../constants/beadLayout";
import PatternRow from "./PatternRow";

const GAP = 0;
const PADDING = 20;

const PatternCanvas = ({
    width,
    height,
    pattern,
    patternType,
    patternName,
    isDirty,
    tool,

    paint,
    fillArea,

    addColumn,
    removeColumn,

    addRow,
    removeRow,

    commitCurrentPattern,
}) => {
    const isPaintingTool =
        tool === "pencil" ||
        tool === "eraser";
    const pointerActiveRef = useRef(false);

    const handleCellAction = useCallback(
        (row, col) => {
            if (tool === "pencil") {
                paint(row, col);
                return;
            }

            if (tool === "eraser") {
                paint(row, col);
                return;
            }

            if (tool === "fill") {
                fillArea(row, col);
                return;
            }

            if (tool === "add-column") {
                addColumn(col);
                return;
            }

            if (tool === "remove-column") {
                removeColumn(col);
                return;
            }

            if (tool === "add-row") {
                addRow(row);
                return;
            }

            if (tool === "remove-row") {
                removeRow(row);
            }
        },
        [
            tool,
            paint,
            fillArea,
            addColumn,
            removeColumn,
            addRow,
            removeRow,
        ]
    );

    const handlePaintStart = useCallback((event) => {
        if (!isPaintingTool) return;

        pointerActiveRef.current = true;
        if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
        }
    }, [isPaintingTool]);

    const handlePaintEnd = useCallback((event) => {
        if (!isPaintingTool) return;

        if (pointerActiveRef.current) {
            commitCurrentPattern();
        }

        pointerActiveRef.current = false;

        if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
        }
    }, [
        isPaintingTool,
        commitCurrentPattern,
    ]);

    const svgWidth =
        width * (BEAD_WIDTH + GAP) +
        PADDING * 2;

    const svgHeight =
        patternType === "peyote"
            ? height *
            (BEAD_HEIGHT + GAP) +
            BEAD_HEIGHT / 2 +
            PADDING * 2
            : height *
            (BEAD_HEIGHT + GAP) +
            PADDING * 2;

    return (
        <div
            className="flex h-full w-full items-center justify-center overflow-auto p-0"
            onPointerUp={handlePaintEnd}
            onPointerCancel={handlePaintEnd}
            onPointerLeave={() => {
                if (pointerActiveRef.current && isPaintingTool) {
                    commitCurrentPattern();
                    pointerActiveRef.current = false;
                }
            }}
        >
            <div className="flex flex-col">
                <div className="mb-2 flex items-center gap-2 text-left text-sm font-medium text-stone-300">
                    <span className="text-lg font-bold uppercase">{patternName || "Diseño sin guardar"}</span>
                    {isDirty && (
                        <span
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-amber-300 ring-1 ring-inset ring-amber-500/40"
                            title="Tienes cambios sin guardar"
                        >
                            <span className="h-1.5 w-1.5 rounded-full mb-0.5 bg-amber-400" />
                            Cambios sin guardar
                        </span>
                    )}
                </div>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="rounded bg-white shadow"
                    onPointerDown={handlePaintStart}
                >
                    {pattern.map(
                        (row, rowIndex) => (
                            <PatternRow
                                key={rowIndex}
                                row={row}
                                rowIndex={rowIndex}
                                patternType={patternType}
                                tool={tool}
                                onPaint={handleCellAction}
                            />
                        )
                    )}
                </svg>
            </div>
        </div>
    );
};

export default PatternCanvas;