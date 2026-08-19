const patternTypes = [
  { value: "peyote", label: "Peyote" },
  { value: "grid", label: "Telar" },
];

const PatternTypeSelector = ({
  patternType,
  setPatternType,
}) => {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-stone-100 mb-2">
        Tipo
      </legend>

      <div className="flex gap-2">
        {patternTypes.map(({ value, label }) => {
          const isSelected = patternType === value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setPatternType(value)}
              className={`flex-1 rounded border-2 px-3 py-1.5 text-sm transition ${isSelected
                ? "border-white bg-stone-200 text-stone-800"
                : "border-stone-500 bg-stone-700 text-stone-200 hover:border-stone-300"
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