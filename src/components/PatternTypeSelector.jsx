const PatternTypeSelector = ({
  patternType,
  setPatternType,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-stone-100">
        Patrón
      </label>

      <select
        value={patternType}
        onChange={(e) =>
          setPatternType(e.target.value)
        }
        className="rounded border bg-stone-600 px-2 py-1 text-sm"
      >
        <option value="peyote">
          Peyote
        </option>

        <option value="grid">
          Telar
        </option>
      </select>
    </div>
  );
};

export default PatternTypeSelector;