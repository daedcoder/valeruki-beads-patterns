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
    <div className="grid grid-cols-2 gap-2 text-stone-100">
      <div className="rounded-md bg-stone-700/70 p-2">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-300">
          Ancho
        </label>
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
          value={height}
          onChange={(e) =>
            resizePattern(
              width,
              Number(e.target.value)
            )
          }
          className="w-full rounded border border-stone-500 bg-stone-800/50 px-2 py-1 text-center text-stone-100 outline-none ring-0 focus:border-sky-300"
          title={`Máximo ${MAX_PATTERN_HEIGHT}`}
        />
      </div>
    </div>
  );
};

export default SizeControls;