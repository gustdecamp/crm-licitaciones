export type Company = "gustdecamp" | "ulivarda";
export type ItemType = "licitacion" | "subvencion";
export type ColumnId = "nuevas" | "para_revisar" | "solicitadas" | "cerradas";

export interface Item {
  id: string;
  company: Company;
  type: ItemType;
  title: string;
  organismo: string;
  presupuesto?: string;
  plazo?: string; // ISO date YYYY-MM-DD
  descripcion: string;
  enlace: string;
  addedAt: string; // ISO datetime
}

export interface ItemsFile {
  generatedAt: string;
  items: Item[];
}

export const COLUMNS: { id: ColumnId; label: string; emoji: string }[] = [
  { id: "nuevas", label: "Nuevas", emoji: "📥" },
  { id: "para_revisar", label: "Para revisar", emoji: "👀" },
  { id: "solicitadas", label: "Solicitadas", emoji: "📝" },
  { id: "cerradas", label: "Cerradas", emoji: "✅" },
];

export const COMPANIES: { id: Company; label: string }[] = [
  { id: "gustdecamp", label: "Gust de Camp" },
  { id: "ulivarda", label: "Ulivarda" },
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isNew(item: Item): boolean {
  const added = new Date(item.addedAt);
  return added >= startOfToday();
}

export function daysUntilPlazo(item: Item): number | null {
  if (!item.plazo) return null;
  const plazo = new Date(item.plazo + "T23:59:59");
  const diff = plazo.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpiring(item: Item): boolean {
  const d = daysUntilPlazo(item);
  return d !== null && d >= 0 && d <= 3;
}

export function isExpired(item: Item): boolean {
  const d = daysUntilPlazo(item);
  return d !== null && d < 0;
}

export function formatPlazo(plazo?: string): string {
  if (!plazo) return "Sin plazo";
  const d = new Date(plazo + "T00:00:00");
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
