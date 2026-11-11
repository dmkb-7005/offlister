import { describe, expect, it } from "vitest";
import { visibleRows, type Row } from "./visible";
import { group, item } from "./test-helpers";

const show = (rows: Row[]) => rows.map((r) => (r.type === "header" ? `[${r.group.id}]` : r.item.id));

describe("visibleRows", () => {
  const g = group("G");
  const items = [
    item("a"),
    item("b", { groupId: "G" }),
    item("c"),
    item("d", { groupId: "G" }),
    item("x", { kind: "buy" }),
  ];

  it("filters by kind and bundles group members at the first member", () => {
    expect(show(visibleRows(items, [g], "todo", "all", "manual"))).toEqual(["a", "[G]", "b", "d", "c"]);
  });

  it("bundles at the first member in the current sort", () => {
    // newest: d, c, b, a  -> group appears where d is
    expect(show(visibleRows(items, [g], "todo", "all", "newest"))).toEqual(["[G]", "d", "b", "c", "a"]);
  });

  it("applies the filter before bundling and hides empty groups", () => {
    const xs = items.map((i) => (i.groupId ? { ...i, done: true } : i));
    expect(show(visibleRows(xs, [g], "todo", "open", "manual"))).toEqual(["a", "c"]);
    expect(show(visibleRows(xs, [g], "todo", "done", "manual"))).toEqual(["[G]", "b", "d"]);
  });

  it("ignores groups of the other kind and unknown group ids", () => {
    const other = group("G", { kind: "buy" });
    expect(show(visibleRows(items, [other], "todo", "all", "manual"))).toEqual(["a", "b", "c", "d"]);
  });

  it("attaches the group to member rows", () => {
    const rows = visibleRows(items, [g], "todo", "all", "manual");
    const b = rows.find((r) => r.type === "item" && r.item.id === "b");
    expect(b && b.type === "item" && b.group?.id).toBe("G");
  });
});
