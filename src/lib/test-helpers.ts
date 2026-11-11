import type { Group, Item, Kind } from "./types";

let n = 0;
export function item(text: string, over: Partial<Item> = {}): Item {
  n++;
  return { id: over.id ?? text, text, done: false, kind: "todo", createdAt: n * 1000, ...over };
}
export function group(id: string, over: Partial<Group> & { kind?: Kind } = {}): Group {
  return { id, name: id, kind: "todo", hue: 0, createdAt: 0, ...over };
}
