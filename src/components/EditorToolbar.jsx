import PatternTypeSelector from "./PatternTypeSelector";
import ToolSelector from "./ToolSelector";
import SizeControls from "./SizeControls";

const EditorToolbar = ({
    patternType,
    setPatternType,
    tool,
    setTool,
    width,
    height,
    resizePattern,
    newPattern,
    undo,
    redo,
    canUndo,
    canRedo,
}) => {
    return (
        <div className="flex items-center gap-4 shadow shadow-stone-800 bg-stone-600 p-2 mt-2 mx-2 rounded-md">

            {/* Tipo de patrón */}
            <PatternTypeSelector
                patternType={patternType}
                setPatternType={setPatternType}
            />

            <div className="h-6 w-px bg-stone-500" />

            {/* Tamaño */}
            <SizeControls
                width={width}
                height={height}
                resizePattern={resizePattern}
            />

            <div className="h-6 w-px bg-stone-500" />

            {/* Herramientas */}
            <ToolSelector
                tool={tool}
                setTool={setTool}
                newPattern={newPattern}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
            />

        </div>
    );
};

export default EditorToolbar;