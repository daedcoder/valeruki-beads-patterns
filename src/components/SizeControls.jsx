import {
  MAX_PATTERN_HEIGHT,
  MAX_PATTERN_WIDTH,
} from "../utils/patternSize";
import { useEffect, useState } from "react";

const SizeControls = ({
  width,
  height,
  resizePattern,
}) => {
  const [widthInput, setWidthInput] = useState(String(width));
  const [heightInput, setHeightInput] = useState(String(height));

  useEffect(() => {
    setWidthInput(String(width));
  }, [width]);

  useEffect(() => {
    setHeightInput(String(height));
  }, [height]);

  const commitWidth = () => {
    const nextWidth = Number(widthInput);

    if (Number.isInteger(nextWidth) && nextWidth >= 1) {
      resizePattern(nextWidth, height);
      return;
    }

    setWidthInput(String(width));
  };

  const commitHeight = () => {
    const nextHeight = Number(heightInput);

    if (Number.isInteger(nextHeight) && nextHeight >= 1) {
      resizePattern(width, nextHeight);
      return;
    }

    setHeightInput(String(height));
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-stone-100">
      <div className="rounded-md bg-stone-700/70 p-2">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-300">
          Ancho
        </label>
        <input
          type="number"
          min="1"
          max={MAX_PATTERN_WIDTH}
          value={widthInput}
          onChange={(e) => setWidthInput(e.target.value)}
          onBlur={commitWidth}
          onClick={commitWidth}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              commitWidth();
            }
          }}
          className="w-full rounded border border-stone-500 bg-stone-800/50 px-2 py-1 text-center text-stone-100 outline-none ring-0 focus:border-sky-300"
          title={`Máximo ${MAX_PATTERN_WIDTH}`}
        />
      </div>

      <div className="rounded-md bg-stone-700/70 p-2">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-300">
          Alto
        </label>
        <input
          type="number"
          min="1"
          max={MAX_PATTERN_HEIGHT}
          value={heightInput}
          onChange={(e) => setHeightInput(e.target.value)}
          onBlur={commitHeight}
          onClick={commitHeight}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              commitHeight();
            }
          }}
          className="w-full rounded border border-stone-500 bg-stone-800/50 px-2 py-1 text-center text-stone-100 outline-none ring-0 focus:border-sky-300"
          title={`Máximo ${MAX_PATTERN_HEIGHT}`}
        />
      </div>
    </div>
  );
};

export default SizeControls;