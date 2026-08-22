const patternTypes = [
    { value: "peyote", label: "Peyote" },
    { value: "telar", label: "Telar" },
];

const PatternTypeSelector = ({
    patternType,
    setPatternType,
}) => {
    return (
        <fieldset className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-800/50 p-1">
                {patternTypes.map(({ value, label }) => {
                    const isSelected = patternType === value;

                    return (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setPatternType(value)}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition ${isSelected
                                ? "bg-sky-300 text-stone-900 shadow-sm"
                                : "bg-transparent text-stone-200 hover:bg-stone-600/70"
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
};

export default PatternTypeSelector;