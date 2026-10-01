"use client";

import { Company, COMPANIES } from "@/lib/items";

interface Props {
  active: Company;
  onChange: (company: Company) => void;
  counts: Record<Company, number>;
}

export default function Header({ active, onChange, counts }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-forest-700 shadow-md">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <h1 className="text-lg font-extrabold text-white">
          🌿 Panel Pau
        </h1>
        <p className="text-xs text-forest-100">
          Licitaciones y subvenciones
        </p>
        <nav className="mt-3 flex gap-2">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`flex-1 rounded-t-xl px-4 py-2.5 text-sm font-bold transition ${
                active === c.id
                  ? "bg-sand-100 text-forest-800"
                  : "bg-forest-600 text-forest-100 hover:bg-forest-500"
              }`}
            >
              {c.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  active === c.id
                    ? "bg-forest-600 text-white"
                    : "bg-forest-700 text-forest-100"
                }`}
              >
                {counts[c.id]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
