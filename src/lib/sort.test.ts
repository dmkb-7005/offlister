import { describe, expect, it } from "vitest";
import { compareText, countByFilter, matchesFilter, sortItems } from "./sort";
import { item } from "./test-helpers";

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("sortItems", () => {
  const a = item("banana", { createdAt: 2 });
  const b = item("Äpfel", { createdAt: 3 });
  const c = item("apple", { createdAt: 1 });
  const list = [a, b, c];

  it("manual keeps array order", () => expect(ids(sortItems(list, "manual"))).toEqual(["banana", "Äpfel", "apple"]));
  it("newest first", () => expect(ids(sortItems(list, "newest"))).toEqual(["Äpfel", "banana", "apple"]));
  it("oldest first", () => expect(ids(sortItems(list, "oldest"))).toEqual(["apple", "banana", "Äpfel"]));
  it("A–Z ignores case and accents", () =>
    expect(ids(sortItems(list, "az"))).toEqual(["Äpfel", "apple", "banana"]));
  it("ties keep manual order", () => {
    const x = item("x", { createdAt: 5 });
    const y = item("y", { createdAt: 5 });
    expect(ids(sortItems([y, x], "newest"))).toEqual(["y", "x"]);
  });
  it("does not mutate input", () => {
    const copy = list.slice();
    sortItems(list, "az");
    expect(list).toEqual(copy);
  });
});

describe("compareText", () => {
  it("treats case and accents as equal", () => {
    expect(compareText("ÉCOLE", "ecole")).toBe(0);
  });
});

describe("filter + counts", () => {
  const xs = [item("a"), item("b", { done: true }), item("c")];
  it("matches", () => {
    expect(xs.filter((i) => matchesFilter(i, "open")).length).toBe(2);
    expect(xs.filter((i) => matchesFilter(i, "done")).length).toBe(1);
    expect(xs.filter((i) => matchesFilter(i, "all")).length).toBe(3);
  });
  it("counts", () => expect(countByFilter(xs)).toEqual({ all: 3, open: 2, done: 1 }));
});
