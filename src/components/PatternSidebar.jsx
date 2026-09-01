"use client"

import { useState } from "react";

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
    newPattern,
    savePattern,
    saveCurrentPattern,
    openedPattern,
    openPatterns,
    isDirty,
}) => {
    const [showNewDialog, setShowNewDialog] =
        useState(false);
    const [showSaveDialog, setShowSaveDialog] =
        useState(false);
    const [saveMode, setSaveMode] = useState("save");
    const [isMinimized, setIsMinimized] = useState(false);
    const [patternName, setPatternName] = useState("");
    const [saveError, setSaveError] = useState("");

    const openSaveDialog = (mode = "save") => {
        setSaveMode(mode);
        setPatternName(mode === "duplicate" ? `${openedPattern?.name ?? ""} copia` : "");
        setSaveError("");
        setShowSaveDialog(true);
    };

    const actions = [
        {
            label: "Nuevo",
            onClick: () => setShowNewDialog(true),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-8" />
                    <path d="M8 14h8" />
                </svg>
            ),
        },
        {
            label: "Guardar",
            onClick: () => {
                if (!openedPattern) {
                    openSaveDialog("save");
                    return;
                }

                if (isDirty) {
                    saveCurrentPattern();
                    return;
                }

                openSaveDialog("duplicate");
            },
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M6 4h10l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    <path d="M9 4v6h6V4" />
                    <path d="M9 18h6" />
                </svg>
            ),
            highlight: isDirty,
        },
        {
            label: "Duplicar",
            onClick: () => openSaveDialog("duplicate"),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-copy"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>
            ),
            highlight: false,
        },
        {
            label: "Abrir",
            onClick: openPatterns,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
                </svg>
            ),
        },
    ];

    const handleNewPattern = () => {
        if (newPattern) {
            newPattern();
        }
        setShowNewDialog(false);
    };

    const handleSavePattern = async (event) => {
        event.preventDefault();

        if (!patternName.trim()) {
            setSaveError("Escribe un nombre para el patrón.");
            return;
        }

        try {
            await savePattern(patternName.trim(), saveMode === "duplicate");
            setShowSaveDialog(false);
        } catch (error) {
            setSaveError(String(error));
        }
    };

    return (
        <aside className={`shrink-0 bg-stone-700 text-stone-100 fixed top-2 z-20 left-2 rounded-lg shadow shadow-black/50 overflow-hidden border border-stone-500 ${isMinimized ? "h-12 w-12 p-1" : "w-70 p-3"}`}>
            {isMinimized ? (
                <button
                    type="button"
                    onClick={() => setIsMinimized(false)}
                    className="flex h-full w-full items-center justify-center rounded-md text-stone-100 transition hover:bg-stone-600"
                    aria-label="Expandir panel de patrones"
                    title="Expandir panel de patrones"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                </button>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        {actions.map(({ label, icon, onClick, highlight }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={onClick}
                                className={`relative flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center text-[11px] text-stone-100 transition ${highlight
                                    ? "bg-amber-600/30 ring-1 ring-inset ring-amber-400/50 hover:bg-amber-600/40"
                                    : "bg-stone-800/50 hover:bg-stone-600"
                                    }`}
                            >
                                {highlight && (
                                    <span
                                        className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse"
                                        title="Cambios sin guardar"
                                    />
                                )}
                                <span className="flex h-8 w-8 items-center justify-center text-stone-100">{icon}</span>
                                <span className="font-medium tracking-tight">{label}</span>
                            </button>
                        ))}
                    </div>

                    {showNewDialog && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                            onMouseDown={() => setShowNewDialog(false)}
                        >
                            <div
                                className="w-full max-w-sm rounded-lg bg-stone-800 p-6 shadow-xl"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-center text-lg font-semibold text-stone-100">
                                    ¿Crear un nuevo patrón?
                                </h2>

                                <div className="mt-6 flex justify-center gap-2">
                                    <button
                                        onClick={() => setShowNewDialog(false)}
                                        className="rounded border border-stone-600 px-4 py-2 text-sm text-stone-200 hover:bg-stone-700"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={handleNewPattern}
                                        className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
                                    >
                                        Sí, nuevo patrón
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSaveDialog && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                            onMouseDown={() => setShowSaveDialog(false)}
                        >
                            <form
                                className="w-full max-w-sm rounded-lg bg-stone-800 border border-stone-600 p-6 shadow shadow-black/50"
                                onSubmit={handleSavePattern}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <h2 className="text-center uppercase font-semibold text-stone-100">
                                    {saveMode === "duplicate" ? "Guardar como" : "Guardar diseño"}
                                </h2>
                                <label className="mt-5 block text-sm text-stone-200">
                                    Nombre del diseño
                                    <input
                                        autoFocus
                                        value={patternName}
                                        onChange={(event) => setPatternName(event.target.value)}
                                        className="mt-2 w-full rounded border border-stone-600 bg-stone-900 px-3 py-2 text-stone-100 outline-none focus:border-blue-400"
                                        maxLength={120}
                                    />
                                </label>
                                {saveError && (
                                    <p className="mt-2 text-sm text-red-300">{saveError}</p>
                                )}
                                <div className="mt-6 flex justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveDialog(false)}
                                        className="rounded border border-stone-600 px-4 py-2 text-sm text-stone-200 hover:bg-stone-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
                                    >
                                        {saveMode === "duplicate" ? "Duplicar" : "Guardar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="my-4 h-px w-full bg-stone-500/80" />

                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                        Propiedades
                    </h2>

                    <div className="mb-4">
                        <PatternTypeSelector
                            patternType={patternType}
                            setPatternType={setPatternType}
                        />
                    </div>

                    <div className="mb-4">
                        <SizeControls
                            width={width}
                            height={height}
                            resizePattern={resizePattern}
                        />
                    </div>

                    <div className="my-4 h-px w-full bg-stone-500/80" />

                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                        Colores usados
                    </h2>

                    <div className="grid grid-cols-6 gap-1.5">
                        {usedColors.length === 0 ? (
                            <div className="col-span-6 rounded border border-dashed border-stone-500 px-2 py-3 text-center text-[10px] text-stone-300">
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
                                        className={`relative h-8 overflow-hidden rounded-sm border ${isSelected ? "border-white ring-1 ring-white" : "border-stone-400/80"}`}
                                        style={{
                                            backgroundColor: item.value,
                                            backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.4) 0%, rgba(255, 255, 255, 0.05) 65%, rgba(0, 0, 0, 0.4) 100%), linear-gradient(to bottom, transparent 65%, rgba(0, 0, 0, 0.3) 100%)",
                                        }}
                                        title={item.name}
                                        aria-label={item.name}
                                    >
                                        <span className="pointer-events-none absolute left-1.5 right-1.5 top-1.5 h-[22%] rounded-[3px] bg-white/20" />
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="my-4 h-px w-full bg-stone-500/80" />

                    <button
                        type="button"
                        onClick={() => setIsMinimized(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-stone-800/50 px-2 py-2 text-xs font-medium text-stone-200 transition hover:bg-stone-600"
                        aria-label="Minimizar panel de patrones"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye-off"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
                        Ocultar Panel
                    </button>
                </>
            )}
        </aside>
    );
};

export default PatternSidebar;