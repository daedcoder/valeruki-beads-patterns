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
                    x={x + 0.5}
                    y={y + 0.5}
                    width={BEAD_WIDTH - 1}
                    height={BEAD_HEIGHT - 1}
                    rx={1.5}
                    fill={color || "#ffffff"}
                    stroke={color ? "#080808" : "#D6D6D6"}
                    strokeWidth="0.6"
                    className=" hover:stroke-stone-900 hover:stroke-2"
                />

                {color && (
                    <line
                        x1={x + 2}
                        y1={y + 2}
                        x2={x + BEAD_WIDTH - 2}
                        y2={y + 2}
                        stroke="white"
                        strokeOpacity="0.2"
                    />
                )}
            </g>
        );
    }
);

Bead.displayName = "Bead";

export default Bead;