import { memo } from "react";

import { BEAD_HEIGHT, BEAD_WIDTH } from "../constants/beadLayout";

const Bead = memo(
    ({
        row,
        col,
        color,
        x,
        y,
        onPaint,
        tool,
    }) => {
        const handlePointerDown = (e) => {
            e.preventDefault();

            onPaint(row, col);
        };

        const handlePointerEnter = (e) => {
            if (
                e.buttons === 1 &&
                (tool === "pencil" ||
                    tool === "eraser")
            ) {
                onPaint(row, col);
            }
        };

        return (
            <g
                onPointerDown={
                    handlePointerDown
                }
                onPointerEnter={
                    handlePointerEnter
                }
                className="cursor-pointer"
            >
                <rect
                    x={x}
                    y={y}
                    width={BEAD_WIDTH}
                    height={BEAD_HEIGHT}
                    rx={2}
                    fill={color || "#ffffff"}
                    stroke="#525252"
                    strokeWidth="1"
                    className=" hover:stroke-stone-900 hover:stroke-2"
                />

                {color && (
                    <line
                        x1={x + 2}
                        y1={y + 2}
                        x2={x + BEAD_WIDTH - 2}
                        y2={y + 2}
                        stroke="white"
                        strokeOpacity="0.25"
                    />
                )}
            </g>
        );
    }
);

Bead.displayName = "Bead";

export default Bead;