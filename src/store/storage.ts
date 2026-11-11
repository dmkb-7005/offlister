import { SORTS, type Group, type Item, type Kind, type State } from "../lib/types";

export const STORAGE_KEY = "offlister.v1";

export function emptyState(): State {
  return { version: 1, items: [], groups: [], sort: "manual" };
}

const isKind = (v: unknown): v is Kind => v === "todo" || v === "buy";
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function parseItem(v: unknown): Item | null {
  if (!isObj(v)) return null;
  const { id, text, done, kind, createdAt, groupId } = v;
  if (typeof id !== "string" || typeof text !== "string" || typeof done !== "boolean") return null;
  if (!isKind(kind) || typeof createdAt !== "number") return null;
  const item: Item = { id, text, done, kind, createdAt };
  if (typeof groupId === "string") item.groupId = groupId;
  return item;
}

function parseGroup(v: unknown): Group | null {
  if (!isObj(v)) return null;
  const { id, name, kind, hue, createdAt } = v;
  if (typeof id !== "string" || typeof name !== "string" || !isKind(kind)) return null;
  if (typeof hue !== "number" || typeof createdAt !== "number") return null;
  return { id, name, kind, hue, createdAt };
}

/** Parse stored JSON defensively: invalid entries are dropped, never thrown. */
export function parseState(raw: string | null): State {
  if (!raw) return emptyState();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyState();
  }
  if (!isObj(data) || data.version !== 1) return emptyState();
  const groups = (Array.isArray(data.groups) ? data.groups : [])
    .map(parseGroup)
    .filter((g): g is Group => g !== null);
  const groupIds = new Set(groups.map((g) => g.id));
  const items = (Array.isArray(data.items) ? data.items : [])
    .map(parseItem)
    .filter((i): i is Item => i !== null)
    .map((i) => {
      if (i.groupId && !groupIds.has(i.groupId)) {
        const { groupId: _drop, ...rest } = i;
        return rest;
      }
      return i;
    });
  const sort = SORTS.includes(data.sort as State["sort"]) ? (data.sort as State["sort"]) : "manual";
  return { version: 1, items, groups, sort };
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadState(storage: StorageLike = localStorage): State {
  try {
    return parseState(storage.getItem(STORAGE_KEY));
  } catch {
    return emptyState();
  }
}

export function saveState(state: State, storage: StorageLike = localStorage): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
