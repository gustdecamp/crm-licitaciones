"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Item,
  ItemsFile,
  Company,
  ColumnId,
  COLUMNS,
  COMPANIES,
} from "@/lib/items";
import { loadState, setOverride, StateMap } from "@/lib/state";
import Header from "./Header";
import Column from "./Column";

interface Props {
  data: ItemsFile;
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
    companyItems.filter((i) => columnOf(i) === col);

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

      <main className="mx-auto max-w-6xl px-4 pt-4">
        {/* Mobile column selector */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto md:hidden">
          {COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => setMobileCol(col.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                mobileCol === col.id
                  ? "bg-forest-600 text-white"
                  : "bg-sand-200 text-forest-700"
              }`}
            >
              {col.emoji} {col.label} ({byColumn(col.id).length})
            </button>
          ))}
        </div>

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
