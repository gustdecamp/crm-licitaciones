"use client";

import {
  Item,
  ColumnId,
  COLUMNS,
  isNew,
  isExpiring,
  isExpired,
  daysUntilPlazo,
  formatPlazo,
} from "@/lib/items";

interface Props {
  item: Item;
  column: ColumnId;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
}

export default function ItemCard({ item, column, onMove, onDelete }: Props) {
  const expired = isExpired(item);
  const expiring = isExpiring(item);
  const isNewItem = isNew(item);
  const days = daysUntilPlazo(item);

  const idx = COLUMNS.findIndex((c) => c.id === column);
  const prev = idx > 0 ? COLUMNS[idx - 1] : null;
  const next = idx < COLUMNS.length - 1 ? COLUMNS[idx + 1] : null;

  const typeStyle =
    item.type === "licitacion"
      ? "bg-blue-100 text-blue-800"
      : "bg-forest-100 text-forest-800";
  const typeLabel = item.type === "licitacion" ? "Licitación" : "Subvención";

  return (
    <div
      className={`rounded-xl border bg-white p-3 shadow-sm transition ${
        expired
          ? "border-gray-200 opacity-60"
          : "border-sand-200 hover:shadow-md"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {isNewItem && (
          <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
            New
          </span>
        )}
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${typeStyle}`}
        >
          {typeLabel}
        </span>
      </div>

      <h3
        className={`text-sm font-bold leading-snug text-forest-900 ${
          expired ? "line-through" : ""
        }`}
      >
        {item.title}
      </h3>

      <p className="mt-1 text-xs font-medium text-forest-600">
        {item.organismo}
      </p>

      {item.presupuesto && (
        <p className="mt-1 text-xs text-gray-600">💶 {item.presupuesto}</p>
      )}

      <p
        className={`mt-1 text-xs font-semibold ${
          expired
            ? "text-gray-400"
            : expiring
              ? "text-red-600"
              : "text-gray-600"
        }`}
      >
        ⏳ {formatPlazo(item.plazo)}
        {days !== null && !expired && days >= 0 && (
          <span className="ml-1 font-normal">
            ({days === 0 ? "hoy" : `${days} d`})
          </span>
        )}
        {expired && <span className="ml-1 font-normal">(vencido)</span>}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-gray-700">
        {item.descripcion}
      </p>

      <a
        href={item.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs font-semibold text-forest-500 underline"
      >
        Ver fuente ↗
      </a>

      <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-2">
        <div className="flex gap-1">
          {prev && (
            <button
              onClick={() => onMove(item.id, prev.id)}
              title={`Mover a ${prev.label}`}
              className="rounded-md bg-sand-100 px-2 py-1 text-xs font-semibold text-forest-700 hover:bg-sand-200"
            >
              ◀
            </button>
          )}
          {next && (
            <button
              onClick={() => onMove(item.id, next.id)}
              title={`Mover a ${next.label}`}
              className="rounded-md bg-sand-100 px-2 py-1 text-xs font-semibold text-forest-700 hover:bg-sand-200"
            >
              ▶
            </button>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm("¿Eliminar esta tarjeta?")) onDelete(item.id);
          }}
          title="Eliminar"
          className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
