import { memo } from "react";

import { BEAD_HEIGHT, BEAD_WIDTH } from "../constants/beadLayout";
import Bead from "./Bead";

const GAP = 0;
const PADDING = 20;

const PatternRow = memo(
    ({
        row,
        rowIndex,
        patternType,
        tool,
        onPaint,
    }) => {
        const isPeyote =
            patternType === "peyote";

        return (
            <>
                {row.map(
                    (beadColor, colIndex) => {
                        const offset =
                            isPeyote &&
                                colIndex % 2 !== 0
                                ? (BEAD_HEIGHT +
                                    GAP) /
                                2
                                : 0;

                        const x =
                            PADDING +
                            colIndex *
                            (BEAD_WIDTH + GAP);

                        const y =
                            PADDING +
                            rowIndex *
                            (BEAD_HEIGHT + GAP) +
                            offset;

                        return (
                            <Bead
                                key={`${rowIndex}-${colIndex}`}
                                row={rowIndex}
                                col={colIndex}
                                color={beadColor}
                                x={x}
                                y={y}
                                tool={tool}
                                onPaint={onPaint}
                            />
                        );
                    }
                )}
            </>
        );
    }
);

PatternRow.displayName =
    "PatternRow";

export default PatternRow;