"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Item,
  ItemType,
  ItemsFile,
  Company,
  ColumnId,
  COLUMNS,
  COMPANIES,
  daysUntilPlazo,
  isNew,
  isExpiring,
} from "@/lib/items";
import { loadState, setOverride, StateMap } from "@/lib/state";
import Header from "./Header";
import Column from "./Column";

interface Props {
  data: ItemsFile;
}

function sortByUrgency(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const aNew = isNew(a) ? 0 : 1;
    const bNew = isNew(b) ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
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
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");

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

  const handleNote = (id: string, note: string) => {
    setState((s) => setOverride(s, id, { note }));
  };

  const handleReviewAll = () => {
    setState((s) => {
      let next = { ...s };
      for (const item of byColumn("nuevas")) {
        next = setOverride(next, item.id, { column: "para_revisar" });
      }
      return next;
    });
  };

  const notes = useMemo(() => {
    const n: Record<string, string> = {};
    for (const [id, ov] of Object.entries(state)) {
      if (ov.note) n[id] = ov.note;
    }
    return n;
  }, [state]);

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

  const companyItems = useMemo(() => {
    let items = visibleItems.filter((i) => i.company === company);
    if (typeFilter !== "all") items = items.filter((i) => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.organismo.toLowerCase().includes(q) ||
          i.descripcion.toLowerCase().includes(q)
      );
    }
    return items;
  }, [visibleItems, company, typeFilter, search]);

  const byColumn = (col: ColumnId) =>
    sortByUrgency(companyItems.filter((i) => columnOf(i) === col));

  const newToday = companyItems.filter((i) => isNew(i) && columnOf(i) === "nuevas").length;
  const urgent = companyItems.filter(
    (i) => isExpiring(i) && columnOf(i) !== "cerradas"
  ).length;
  const pendingReview = byColumn("nuevas").length;

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

      {/* Summary banner */}
      <div className="mx-auto max-w-6xl px-3 pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-forest-900 px-4 py-3 text-sm">
          {newToday > 0 && (
            <span className="font-bold text-amber-400">
              🆕 {newToday} nueva{newToday > 1 ? "s" : ""} hoy
            </span>
          )}
          {urgent > 0 && (
            <span className="font-bold text-red-400">
              ⚠️ {urgent} urgente{urgent > 1 ? "s" : ""} (&lt;3 d)
            </span>
          )}
          {pendingReview > 0 && (
            <span className="text-forest-300">
              📥 {pendingReview} en Nuevas
            </span>
          )}
          {newToday === 0 && urgent === 0 && pendingReview === 0 && (
            <span className="text-forest-300">✅ Todo al día</span>
          )}
          {pendingReview > 0 && (
            <button
              onClick={handleReviewAll}
              className="ml-auto rounded-lg bg-forest-600 px-3 py-1 text-xs font-bold text-white active:bg-forest-500"
            >
              ✓ Revisar todas
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-3 pt-3">
        {/* Filters */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="search"
            placeholder="🔍 Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 rounded-xl border border-sand-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-forest-400"
          />
          {/* Type filter */}
          <div className="flex gap-1.5">
            {(["all", "licitacion", "subvencion"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  typeFilter === t
                    ? "bg-forest-600 text-white"
                    : "bg-sand-200 text-forest-700"
                }`}
              >
                {t === "all" ? "Todos" : t === "licitacion" ? "Licitaciones" : "Subvenciones"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile column selector */}
        <div className="mb-3 flex gap-1.5 overflow-x-auto md:hidden">
          {COLUMNS.map((col) => {
            const count = byColumn(col.id).length;
            const hasNew = col.id === "nuevas" && newToday > 0;
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
          Desliza ← → para mover · 📝 para notas
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
              notes={notes}
              onMove={handleMove}
              onDelete={handleDelete}
              onNote={handleNote}
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
              notes={notes}
              onMove={handleMove}
              onDelete={handleDelete}
              onNote={handleNote}
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
