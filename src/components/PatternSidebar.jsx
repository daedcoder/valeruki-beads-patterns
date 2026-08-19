import SizeControls from "./SizeControls";
import PatternTypeSelector from "./PatternTypeSelector";

const PatternSidebar = ({
    patternType,
    setPatternType,
    width,
    height,
    resizePattern,
    usedColors,
    color,
    setColor,
    setTool,
}) => {
    return (
        <aside className="max-w-fit shrink-0 bg-stone-600 p-3">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-200">
                propiedades del patrón
            </h2>
            <div className="mb-3">
                <PatternTypeSelector
                    patternType={patternType}
                    setPatternType={setPatternType}
                />
            </div>

            <div className="my-5 h-px w-full bg-stone-500" />

            <div className="mb-3">
                <SizeControls
                    width={width}
                    height={height}
                    resizePattern={resizePattern}
                />
            </div>

            <div className="my-5 h-px w-full bg-stone-500" />

            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-200">
                Colores Usados
            </h2>
            <div className="flex flex-col gap-2">
                {usedColors.length === 0 ? (
                    <div className="rounded border border-dashed border-stone-500 px-2 py-3 text-center text-xs text-stone-300">
                        Diseña algo para ver los colores aquí.
                    </div>
                ) : (
                    usedColors.map((item) => {
                        const isSelected = color === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                    setColor(item.value);
                                    setTool("pencil");
                                }}
                                className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-sm transition ${isSelected
                                    ? "border-blue-400 bg-stone-800 text-white"
                                    : "border-stone-600 bg-stone-800/60 text-stone-200 hover:bg-stone-700"
                                    }`}
                            >
                                <span
                                    className="h-5 w-5 rounded border border-stone-300"
                                    style={{ backgroundColor: item.value }}
                                    aria-label={item.name}
                                />
                                <span className="truncate">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </aside>
    );
};

export default PatternSidebar;