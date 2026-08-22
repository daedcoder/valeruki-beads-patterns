import ColorPalette from "./ColorPalette";

const ColorSidebar = ({ color, setColor, setTool }) => {
    return (
        <aside className="w-60 shrink-0 bg-stone-700 p-3 fixed top-2 right-2 rounded-lg shadow shadow-black/50 overflow-hidden border border-stone-500">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                lista de Colores
            </h2>
            <ColorPalette
                color={color}
                setColor={setColor}
                setTool={setTool}
            />
        </aside>
    );
};

export default ColorSidebar;