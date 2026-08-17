const SizeControls = ({
  width,
  height,
  resizePattern,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-stone-100">
        Ancho
      </label>

      <input
        type="number"
        min="1"
        value={width}
        onChange={(e) =>
          resizePattern(
            Number(e.target.value),
            height
          )
        }
        className="w-16 rounded border px-2 py-1 text-center text-stone-100"
      />

      <label className="text-sm text-stone-100">
        Alto
      </label>

      <input
        type="number"
        min="1"
        value={height}
        onChange={(e) =>
          resizePattern(
            width,
            Number(e.target.value)
          )
        }
        className="w-16 rounded border px-2 py-1 text-center text-stone-100"
      />
    </div>
  );
};

export default SizeControls;