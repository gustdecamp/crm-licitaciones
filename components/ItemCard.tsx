"use client";

import { useRef, useState } from "react";
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

const SWIPE_THRESHOLD = 55;

export default function ItemCard({ item, column, onMove, onDelete }: Props) {
  const expired = isExpired(item);
  const expiring = isExpiring(item);
  const isNewItem = isNew(item);
  const days = daysUntilPlazo(item);

  const idx = COLUMNS.findIndex((c) => c.id === column);
  const prev = idx > 0 ? COLUMNS[idx - 1] : null;
  const next = idx < COLUMNS.length - 1 ? COLUMNS[idx + 1] : null;

  const touchStartX = useRef<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Clamp to avoid too much travel
    setSwipeDelta(Math.max(-100, Math.min(100, delta)));
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (swipeDelta > SWIPE_THRESHOLD && next) {
      onMove(item.id, next.id);
    } else if (swipeDelta < -SWIPE_THRESHOLD && prev) {
      onMove(item.id, prev.id);
    }
    touchStartX.current = null;
    setSwipeDelta(0);
    setSwiping(false);
  };

  const typeStyle =
    item.type === "licitacion"
      ? "bg-blue-100 text-blue-800"
      : "bg-forest-100 text-forest-800";
  const typeLabel = item.type === "licitacion" ? "Licitación" : "Subvención";

  // Swipe hint color
  const swipeRight = swipeDelta > 20 && next;
  const swipeLeft = swipeDelta < -20 && prev;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all select-none ${
        expired
          ? "border-gray-200 opacity-60"
          : swiping
            ? "border-forest-400 shadow-md"
            : "border-sand-200 hover:shadow-md"
      }`}
      style={{
        transform: swiping ? `translateX(${swipeDelta * 0.4}px)` : undefined,
        transition: swiping ? "none" : "transform 0.2s ease",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe direction indicator */}
      {swipeRight && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end rounded-xl bg-green-50/70 pr-4 text-lg font-bold text-green-600">
          → {next?.label}
        </div>
      )}
      {swipeLeft && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-start rounded-xl bg-amber-50/70 pl-4 text-lg font-bold text-amber-600">
          {prev?.label} ←
        </div>
      )}

      <div className="p-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {isNewItem && (
            <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
              🆕 NEW
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

        {/* Action bar */}
        <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-2">
          <div className="flex gap-2">
            {prev && (
              <button
                onClick={() => onMove(item.id, prev.id)}
                title={`← ${prev.label}`}
                className="rounded-lg bg-sand-100 px-3 py-2 text-sm font-bold text-forest-700 active:bg-sand-300"
              >
                ◀
              </button>
            )}
            {next && (
              <button
                onClick={() => onMove(item.id, next.id)}
                title={`${next.label} →`}
                className={`rounded-lg px-3 py-2 text-sm font-bold active:opacity-80 ${
                  column === "nuevas"
                    ? "bg-forest-600 text-white"
                    : "bg-sand-100 text-forest-700"
                }`}
              >
                {column === "nuevas" ? "✓ Revisar" : "▶"}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm("¿Eliminar?")) onDelete(item.id);
            }}
            title="Eliminar"
            className="rounded-lg px-2 py-2 text-sm text-gray-400 active:bg-red-50 active:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
