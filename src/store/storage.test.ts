import { describe, expect, it } from "vitest";
import { emptyState, loadState, parseState, saveState, STORAGE_KEY } from "./storage";
import type { State } from "../lib/types";

function memory() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

const sample: State = {
  version: 1,
  items: [
    { id: "1", text: "Milk", done: false, kind: "buy", createdAt: 1, groupId: "g" },
    { id: "2", text: "Call", done: true, kind: "todo", createdAt: 2 },
  ],
  groups: [{ id: "g", name: "Dairy", kind: "buy", hue: 205, createdAt: 0 }],
  sort: "az",
};

describe("storage", () => {
  it("round-trips", () => {
    const s = memory();
    expect(saveState(sample, s)).toBe(true);
    expect(s.m.has(STORAGE_KEY)).toBe(true);
    expect(loadState(s)).toEqual(sample);
  });

  it("returns an empty state for missing, corrupt or unknown-version data", () => {
    expect(parseState(null)).toEqual(emptyState());
    expect(parseState("{not json")).toEqual(emptyState());
    expect(parseState(JSON.stringify({ version: 2, items: [] }))).toEqual(emptyState());
  });

  it("drops invalid entries and dangling group ids, defaults bad sort", () => {
    const raw = JSON.stringify({
      version: 1,
      items: [sample.items[1], { id: 3 }, { ...sample.items[0], groupId: "missing" }],
      groups: [{ id: "x" }],
      sort: "random",
    });
    const s = parseState(raw);
    expect(s.items.map((i) => i.id)).toEqual(["2", "1"]);
    expect(s.items[1].groupId).toBeUndefined();
    expect(s.groups).toEqual([]);
    expect(s.sort).toBe("manual");
  });

  it("survives a throwing storage", () => {
    const bad = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("quota"); } };
    expect(loadState(bad)).toEqual(emptyState());
    expect(saveState(sample, bad)).toBe(false);
  });
});
