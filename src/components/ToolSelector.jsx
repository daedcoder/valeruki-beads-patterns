import { useState } from "react";

const EditorToolbar = ({
  tool,
  setTool,
  undo,
  redo,
  canUndo,
  canRedo,
}) => {

  return (
    <>
      <div className="fixed top-2 z-30 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-2 bg-stone-700 py-2 px-3 rounded-lg shadow shadow-black/50 overflow-hidden border border-stone-500">

        {/* PINTAR */}
        <button
          onClick={() => setTool("pencil")}
          title="Dibujar"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "pencil"
              ? "bg-stone-200 border-white"
              : "bg-stone-700 text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
            <path d="M13.5 6.5l4 4" />
            <path d="M16 19h6" />
            <path d="M19 16v6" />
          </svg>
        </button>

        {/* BORRADOR */}
        <button
          onClick={() => setTool("eraser")}
          title="Borrar"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "eraser"
              ? "bg-stone-200 text-red-700 border-white"
              : "bg-stone-700 text-red-300"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
            <path d="M13.5 6.5l4 4" />
            <path d="M16 19h6" />
          </svg>
        </button>

        {/* AGREGAR COLUMNA */}
        <button
          onClick={() =>
            setTool("add-column")
          }
          title="Agregar Columna"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "add-column"
              ? "bg-stone-200 border-white"
              : "bg-stone-700 text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M6 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1" />
            <path d="M15 12l4 0" />
            <path d="M17 10l0 4" />
          </svg>
        </button>

        {/* ELIMINAR COLUMNA */}
        <button
          onClick={() =>
            setTool("remove-column")
          }
          title="Eliminar Columna"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "remove-column"
              ? "bg-stone-200 text-red-700 border-white"
              : "bg-stone-700 text-red-300"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M6 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1" />
            <path d="M16 10l4 4" />
            <path d="M16 14l4 -4" />
          </svg>
        </button>

        {/* AGREGAR FILA */}
        <button
          onClick={() => setTool("add-row")}
          title="Agregar Fila"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "add-row"
              ? "bg-stone-200 border-white"
              : "bg-stone-700 text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M20 6v4a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1" />
            <path d="M12 15l0 4" />
            <path d="M14 17l-4 0" />
          </svg>
        </button>

        {/* ELIMINAR FILA */}
        <button
          onClick={() =>
            setTool("remove-row")
          }
          title="Eliminar Fila"
          className={`border-2 border-stone-700 hover:bg-stone-600 rounded p-2 text-sm ${tool === "remove-row"
              ? "bg-stone-200 text-red-700 border-white"
              : "bg-stone-700 text-red-300 "
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M20 6v4a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1" />
            <path d="M10 16l4 4" />
            <path d="M10 20l4 -4" />
          </svg>
        </button>

        {/* BALDE */}
        <button
          onClick={() => setTool("fill")}
          title="Rellenar"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "fill"
              ? "bg-stone-200 border-white"
              : "bg-stone-700 text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              stroke="none"
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path d="M5 16l1.465 1.638a2 2 0 1 1 -3.015 .099l1.55 -1.737" />
            <path d="M13.737 9.737c2.299 -2.3 3.23 -5.095 2.081 -6.245c-1.15 -1.15 -3.945 -.217 -6.244 2.082c-2.3 2.299 -3.231 5.095 -2.082 6.244c1.15 1.15 3.946 .218 6.245 -2.081" />
            <path d="M7.492 11.818c.362 .362 .768 .676 1.208 .934l6.895 4.047c1.078 .557 2.255 -.075 3.692 -1.512c1.437 -1.437 2.07 -2.614 1.512 -3.692c-.372 -.718 -1.72 -3.017 -4.047 -6.895a6.015 6.015 0 0 0 -.934 -1.208" />
          </svg>
        </button>

        {/* REEMPLAZAR COLOR */}
        <button
          onClick={() => setTool("replace")}
          title="Reemplazar color"
          className={`rounded border-2 border-stone-700 hover:bg-stone-600 p-2 text-sm ${tool === "replace"
              ? "bg-stone-200 border-white"
              : "bg-stone-700 text-white"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 17h5l1.67 -2.386m3.66 -5.227l1.67 -2.387h6" />
            <path d="M18 4l3 3l-3 3" />
            <path d="M3 7h5l7 10h6" />
            <path d="M18 20l3 -3l-3 -3" />
          </svg>
        </button>

        <div className="h-12 w-px bg-stone-500" />

        {/* DESHACER */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Deshacer"
          className={`rounded border-2 border-stone-700 p-2 text-sm ${canUndo
              ? "bg-stone-700 text-white hover:bg-stone-600"
              : "bg-stone-700 text-stone-400 border-stone-700 cursor-not-allowed"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 14l-4 -4l4 -4" />
            <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
          </svg>
        </button>

        {/* REHACER */}
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Rehacer"
          className={`rounded border-2 p-2 text-sm ${canRedo
              ? "bg-stone-700 text-white border-stone-700 hover:bg-stone-600"
              : "bg-stone-700 text-stone-400 border-stone-700 cursor-not-allowed"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 14l4 -4l-4 -4" />
            <path d="M19 10h-11a4 4 0 1 0 0 8h1" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default EditorToolbar;