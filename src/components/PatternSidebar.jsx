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
    const [patternName, setPatternName] = useState("");
    const [saveError, setSaveError] = useState("");

    const openSaveDialog = () => {
        setPatternName("");
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
            onClick: openedPattern ? saveCurrentPattern : openSaveDialog,
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
            await savePattern(patternName.trim());
            setShowSaveDialog(false);
        } catch (error) {
            setSaveError(String(error));
        }
    };

    return (
        <aside className="w-70 shrink-0 bg-stone-700 p-3 text-stone-100 fixed top-2 left-2 rounded-lg shadow shadow-black/50 overflow-hidden border border-stone-500">
            <div className="grid grid-cols-3 gap-2">
                {actions.map(({ label, icon, onClick, highlight }) => (
                    <button
                        key={label}
                        type="button"
                        onClick={onClick}
                        className={`relative flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center text-[11px] text-stone-100 transition ${
                            highlight
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
                            Guardar diseño
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
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="my-4 h-px w-full bg-stone-500/80" />

            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                Propiedades del patrón
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
                                className={`h-8 rounded-sm border ${isSelected ? "border-white ring-1 ring-white" : "border-stone-400/80"}`}
                                style={{ backgroundColor: item.value }}
                                title={item.name}
                                aria-label={item.name}
                            />
                        );
                    })
                )}
            </div>
        </aside>
    );
};

export default PatternSidebar;