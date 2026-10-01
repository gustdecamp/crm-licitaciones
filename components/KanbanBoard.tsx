"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Item,
  ItemsFile,
  Company,
  ColumnId,
  COLUMNS,
  COMPANIES,
  daysUntilPlazo,
  isNew,
} from "@/lib/items";
import { loadState, setOverride, StateMap } from "@/lib/state";
import Header from "./Header";
import Column from "./Column";

interface Props {
  data: ItemsFile;
}

function sortByUrgency(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    // NEW items first
    const aNew = isNew(a) ? 0 : 1;
    const bNew = isNew(b) ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    // Then by deadline ascending (most urgent first)
    const aD = daysUntilPlazo(a) ?? 9999;
    const bD = daysUntilPlazo(b) ?? 9999;
    return aD - bD;
  });
}

export default function KanbanBoard({ data }: Props) {
  const [state, setState] = useState<StateMap>({});
  const [company, setCompany] = useState<Company>("gustdecamp");
  const [mobileCol, setMobileCol] = useState<ColumnId>("nuevas");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  const handleMove = (id: string, column: ColumnId) => {
    setState((s) => setOverride(s, id, { column }));
  };

  const handleDelete = (id: string) => {
    setState((s) => setOverride(s, id, { deleted: true }));
  };

  const columnOf = (item: Item): ColumnId =>
    state[item.id]?.column ?? "nuevas";

  const visibleItems = useMemo(
    () => data.items.filter((i) => !state[i.id]?.deleted),
    [data.items, state]
  );

  const counts = useMemo(() => {
    const c: Record<Company, number> = { gustdecamp: 0, ulivarda: 0 };
    for (const i of visibleItems) c[i.company]++;
    return c;
  }, [visibleItems]);

  const companyItems = visibleItems.filter((i) => i.company === company);

  const byColumn = (col: ColumnId) =>
    sortByUrgency(companyItems.filter((i) => columnOf(i) === col));

  const newCount = byColumn("nuevas").filter(isNew).length;

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-forest-600">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <Header active={company} onChange={setCompany} counts={counts} />

      <main className="mx-auto max-w-6xl px-3 pt-4">
        {/* Mobile column selector */}
        <div className="mb-3 flex gap-1.5 overflow-x-auto md:hidden">
          {COLUMNS.map((col) => {
            const count = byColumn(col.id).length;
            const hasNew = col.id === "nuevas" && newCount > 0;
            return (
              <button
                key={col.id}
                onClick={() => setMobileCol(col.id)}
                className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  mobileCol === col.id
                    ? "bg-forest-600 text-white"
                    : "bg-sand-200 text-forest-700"
                }`}
              >
                {col.emoji} {col.label} ({count})
                {hasNew && (
                  <span className="ml-1 rounded bg-amber-400 px-1 text-[9px] font-extrabold text-amber-950">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile swipe hint */}
        <p className="mb-3 text-center text-[11px] text-gray-400 md:hidden">
          Desliza las tarjetas ← → para moverlas de columna
        </p>

        {/* Mobile: single column */}
        <div className="md:hidden">
          {COLUMNS.filter((c) => c.id === mobileCol).map((col) => (
            <Column
              key={col.id}
              label={col.label}
              emoji={col.emoji}
              columnId={col.id}
              items={byColumn(col.id)}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Desktop: 4 columns */}
        <div className="hidden grid-cols-4 gap-4 md:grid">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              label={col.label}
              emoji={col.emoji}
              columnId={col.id}
              items={byColumn(col.id)}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Actualizado:{" "}
          {new Date(data.generatedAt).toLocaleString("es-ES")} ·{" "}
          {COMPANIES.find((c) => c.id === company)?.label}
        </p>
      </main>
    </div>
  );
}
