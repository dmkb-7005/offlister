import type { Item } from "./types";

/**
 * Move `id` so that, in the visible list, it lands at `toIndex`
 * (index in the visible list *after* removing the item). Hidden items keep
 * their positions; the moved item is placed directly before its new visible
 * successor, or directly after its new visible predecessor at the end.
 */
export function moveItem(
  items: readonly Item[],
  visibleIds: readonly string[],
  id: string,
  toIndex: number,
): Item[] {
  const from = items.findIndex((i) => i.id === id);
  if (from < 0) return items.slice();
  const moving = items[from];
  const rest = items.filter((i) => i.id !== id);
  const others = visibleIds.filter((v) => v !== id);
  if (others.length === 0) return items.slice();

  const t = Math.max(0, Math.min(toIndex, others.length));
  let insertAt: number;
  if (t < others.length) {
    insertAt = rest.findIndex((i) => i.id === others[t]);
  } else {
    insertAt = rest.findIndex((i) => i.id === others[others.length - 1]) + 1;
  }
  if (insertAt < 0) return items.slice();
  rest.splice(insertAt, 0, moving);
  return rest;
}

