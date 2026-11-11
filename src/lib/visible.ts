import { matchesFilter, sortItems } from "./sort";
import type { Filter, Group, Item, Kind, Sort } from "./types";

export type Row =
  | { type: "header"; group: Group }
  | { type: "item"; item: Item; group?: Group };

/**
 * Visible list = items of the active kind -> filter -> sort -> group bundling.
 * Each group's members are moved to the position of its first member and
 * preceded by a header row. Groups with no visible members show nothing.
 */
export function visibleRows(
  items: readonly Item[],
  groups: readonly Group[],
  kind: Kind,
  filter: Filter,
  sort: Sort,
): Row[] {
  const groupById = new Map(groups.filter((g) => g.kind === kind).map((g) => [g.id, g]));
  const sorted = sortItems(
    items.filter((i) => i.kind === kind && matchesFilter(i, filter)),
    sort,
  );

  const members = new Map<string, Item[]>();
  for (const item of sorted) {
    const g = item.groupId && groupById.get(item.groupId);
    if (g) {
      const list = members.get(g.id) ?? [];
      list.push(item);
      members.set(g.id, list);
    }
  }

  const rows: Row[] = [];
  const emitted = new Set<string>();
  for (const item of sorted) {
    const g = item.groupId ? groupById.get(item.groupId) : undefined;
    if (!g) {
      rows.push({ type: "item", item });
      continue;
    }
    if (emitted.has(g.id)) continue;
    emitted.add(g.id);
    rows.push({ type: "header", group: g });
    for (const m of members.get(g.id)!) rows.push({ type: "item", item: m, group: g });
  }
  return rows;
}
