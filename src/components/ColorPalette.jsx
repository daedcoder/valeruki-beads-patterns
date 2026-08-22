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
            <div className="flex items-center pl-2 rounded-md border border-stone-500 overflow-hidden bg-stone-800">
                <svg className="text-stone-100" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-search"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filtrar colores"
                    className="w-full bg-stone-800 p-2 text-sm text-stone-100 placeholder:text-stone-400 focus:border-blue-400 focus:outline-none"
                />
            </div>

            <div className="flex max-h-[calc(100vh-117px)] flex-col gap-2 overflow-y-auto pr-2.5">
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
                            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition ${isSelected
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