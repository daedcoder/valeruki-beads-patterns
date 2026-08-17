import { useCallback, useRef } from "react";

import PatternRow from "./PatternRow";

const BEAD_WIDTH = 11;
const BEAD_HEIGHT = 12;
const GAP = 0;
const PADDING = 20;

const PatternCanvas = ({
  width,
  height,
  pattern,
  patternType,
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
  );
};

export default PatternCanvas;