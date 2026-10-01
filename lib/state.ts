import type { ColumnId } from "./items";

const KEY = "panel-pau-state";

export interface ItemOverride {
  column?: ColumnId;
  deleted?: boolean;
  note?: string;
}

export type StateMap = Record<string, ItemOverride>;

export function loadState(): StateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StateMap) : {};
  } catch {
    return {};
  }
}

export function saveState(state: StateMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode errors
  }
}

export function setOverride(
  state: StateMap,
  id: string,
  patch: ItemOverride
): StateMap {
  const next = { ...state, [id]: { ...state[id], ...patch } };
  saveState(next);
  return next;
}
