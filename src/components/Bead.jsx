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
                (tool === "pencil" || tool === "eraser")
            ) {
                onPaint(row, col);
            }
        };

        return (
            <g
                onPointerDown={handlePointerDown}
                onPointerEnter={handlePointerEnter}
                className="cursor-pointer"
            >
                {color && (
                    <defs>
                        {/* Gradiente vertical para sombra en la base y brillo arriba */}
                        <linearGradient
                            id={`bead-volume-${row}-${col}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="65%" stopColor="#000000" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                        </linearGradient>

                        {/* Gradiente horizontal para dar el efecto cilíndrico (curvatura) */}
                        <linearGradient
                            id={`bead-roundness-${row}-${col}`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                )}

                {/* Base de la cuenta */}
                <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width={BEAD_WIDTH - 1}
                    height={BEAD_HEIGHT - 1}
                    rx={2.5}
                    fill={color || "#ffffff"}
                    stroke={color ? "#0D0D0D" : "#D6D6D6"}
                    strokeWidth="0.5"
                    className="hover:stroke-stone-900 hover:stroke-2"
                />

                {color && (
                    <>
                        {/* Capa 1: Curvatura horizontal (efecto cilíndrico) */}
                        <rect
                            x={x + 0.5}
                            y={y + 0.5}
                            width={BEAD_WIDTH - 1}
                            height={BEAD_HEIGHT - 1}
                            rx={2.5}
                            fill={`url(#bead-roundness-${row}-${col})`}
                            pointerEvents="none"
                        />

                        {/* Capa 2: Gradiente de volumen top/bottom */}
                        <rect
                            x={x + 0.5}
                            y={y + 0.5}
                            width={BEAD_WIDTH - 1}
                            height={BEAD_HEIGHT - 1}
                            rx={2.5}
                            fill={`url(#bead-volume-${row}-${col})`}
                            pointerEvents="none"
                        />

                        {/* Capa 3: Brillo blanco superior (Highlight focalizado) */}
                        <rect
                            x={x + 1.5}
                            y={y + 1.5}
                            width={BEAD_WIDTH - 3}
                            height={BEAD_HEIGHT * 0.22}
                            rx={1.5}
                            fill="#ffffff"
                            fillOpacity="0.2"
                            pointerEvents="none"
                        />
                    </>
                )}
            </g>
        );
    }
);

Bead.displayName = "Bead";

export default Bead;