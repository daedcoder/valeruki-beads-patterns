import { useState } from "react";

import ColorPalette from "./ColorPalette";

const ColorSidebar = ({ color, setColor, setTool }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <aside className={`shrink-0 bg-stone-700 text-stone-100 fixed top-2 z-20 right-2 rounded-lg shadow shadow-black/50 overflow-hidden border border-stone-500 ${isMinimized ? "h-12 w-12 p-1" : "w-60 p-3"}`}>
            {isMinimized ? (
                <button
                    type="button"
                    onClick={() => setIsMinimized(false)}
                    className="flex h-full w-full items-center justify-center rounded-md text-stone-100 transition hover:bg-stone-600"
                    aria-label="Expandir panel de colores"
                    title="Expandir panel de colores"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                    </svg>
                </button>
            ) : (
                <>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                lista de Colores
            </h2>
            <ColorPalette
                color={color}
                setColor={setColor}
                setTool={setTool}
            />
                    <button
                        type="button"
                        onClick={() => setIsMinimized(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-stone-800/50 px-2 py-2 text-xs font-medium text-stone-200 transition hover:bg-stone-600"
                        aria-label="Minimizar panel de colores"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                            <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                            <path d="M3 3l18 18" />
                        </svg>
                        Ocultar Panel
                    </button>
                </>
            )}
        </aside>
    );
};

export default ColorSidebar;