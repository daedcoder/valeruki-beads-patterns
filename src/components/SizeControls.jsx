import {
  MAX_PATTERN_HEIGHT,
  MAX_PATTERN_WIDTH,
} from "../utils/patternSize";

const SizeControls = ({
  width,
  height,
  resizePattern,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <label className="text-sm text-stone-100">
          Ancho
        </label>
      </div>

      <input
        type="number"
        min="1"
        max={MAX_PATTERN_WIDTH}
        value={width}
        onChange={(e) =>
          resizePattern(
            Number(e.target.value),
            height
          )
        }
        className="w-16 rounded border px-2 py-1 text-center text-stone-100"
        title={`Máximo ${MAX_PATTERN_WIDTH}`}
      />

      <div className="flex items-center gap-1">
        <label className="text-sm text-stone-100">
          Alto
        </label>
      </div>

      <input
        type="number"
        min="1"
        max={MAX_PATTERN_HEIGHT}
        value={height}
        onChange={(e) =>
          resizePattern(
            width,
            Number(e.target.value)
          )
        }
        className="w-16 rounded border px-2 py-1 text-center text-stone-100"
        title={`Máximo ${MAX_PATTERN_HEIGHT}`}
      />
    </div>
  );
};

export default SizeControls;