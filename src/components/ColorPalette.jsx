import { useMemo, useState } from "react";

import COLORS from "../data/colors";

const ColorPalette = ({
  color,
  setColor,
  setTool,
}) => {
  const [filter, setFilter] = useState("");

  const filteredColors = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();

    if (!normalizedFilter) return COLORS;

    return COLORS.filter((item) =>
      item.name.toLowerCase().includes(normalizedFilter)
    );
  }, [filter]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrar colores"
        className="w-full rounded border border-stone-400 bg-stone-800 px-2 py-1 text-sm text-stone-100 placeholder:text-stone-400 focus:border-blue-400 focus:outline-none"
      />

      <div className="flex max-h-[calc(100vh-190px)] flex-col gap-2 overflow-y-auto pr-1">
        {filteredColors.map((item) => {
          const isSelected = color === item.value;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setColor(item.value);
                setTool("pencil");
              }}
              className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition ${
                isSelected
                  ? "border-blue-400 bg-stone-800 text-white"
                  : "border-stone-600 bg-stone-800/60 text-stone-200 hover:bg-stone-700"
              }`}
            >
              <span
                className="h-6 w-6 rounded border border-stone-300"
                style={{ backgroundColor: item.value }}
                aria-label={item.name}
              />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}

        {filteredColors.length === 0 && (
          <div className="rounded border border-dashed border-stone-500 px-2 py-3 text-center text-xs text-stone-300">
            No se encontró ningún color
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;