"use client";

import { Item, ColumnId } from "@/lib/items";
import ItemCard from "./ItemCard";

interface Props {
  label: string;
  emoji: string;
  columnId: ColumnId;
  items: Item[];
  notes: Record<string, string>;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
  onNote: (id: string, note: string) => void;
}

export default function Column({
  label,
  emoji,
  columnId,
  items,
  notes,
  onMove,
  onDelete,
  onNote,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-sand-100/60 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-forest-800">
          {emoji} {label}
        </h2>
        <span className="rounded-full bg-forest-600 px-2 py-0.5 text-xs font-bold text-white">
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-gray-400">
            Sin tarjetas
          </p>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              column={columnId}
              note={notes[item.id]}
              onMove={onMove}
              onDelete={onDelete}
              onNote={onNote}
            />
          ))
        )}
      </div>
    </div>
  );
}
