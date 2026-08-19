import ColorPalette from "./ColorPalette";

const ColorSidebar = ({ color, setColor, setTool }) => {
    return (
        <aside className="w-60 shrink-0 bg-stone-600 p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-200">
                lista de Colores
            </div>
            <ColorPalette
                color={color}
                setColor={setColor}
                setTool={setTool}
            />
        </aside>
    );
};

export default ColorSidebar;