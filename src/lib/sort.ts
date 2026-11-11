import type { Filter, Item, Sort } from "./types";

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

/** Case- and accent-insensitive comparison. */
export function compareText(a: string, b: string): number {
  return collator.compare(a, b);
}

export function matchesFilter(item: Item, filter: Filter): boolean {
  if (filter === "open") return !item.done;
  if (filter === "done") return item.done;
  return true;
}

export function countByFilter(items: readonly Item[]): Record<Filter, number> {
  let done = 0;
  for (const i of items) if (i.done) done++;
  return { all: items.length, open: items.length - done, done };
}

/** Stable sort; "manual" keeps array order. Ties fall back to manual order. */
export function sortItems(items: readonly Item[], sort: Sort): Item[] {
  const indexed = items.map((item, index) => ({ item, index }));
  const cmp: Record<Sort, (a: Item, b: Item) => number> = {
    manual: () => 0,
    newest: (a, b) => b.createdAt - a.createdAt,
    oldest: (a, b) => a.createdAt - b.createdAt,
    az: (a, b) => compareText(a.text, b.text),
  };
  const f = cmp[sort];
  indexed.sort((a, b) => f(a.item, b.item) || a.index - b.index);
  return indexed.map((x) => x.item);
}
