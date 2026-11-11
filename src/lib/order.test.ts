import { describe, expect, it } from "vitest";
import { moveItem } from "./order";
import { item } from "./test-helpers";

const ids = (xs: { id: string }[]) => xs.map((x) => x.id).join("");

describe("moveItem", () => {
  const all = ["a", "b", "c", "d", "e"].map((t) => item(t));

  it("moves within a fully visible list", () => {
    const v = ["a", "b", "c", "d", "e"];
    expect(ids(moveItem(all, v, "a", 2))).toBe("bcade");
    expect(ids(moveItem(all, v, "e", 0))).toBe("eabcd");
    expect(ids(moveItem(all, v, "b", 4))).toBe("acdeb");
  });

  it("keeps hidden items in place, inserting before the new visible successor", () => {
    // b and d hidden (e.g. done, or other list)
    const v = ["a", "c", "e"];
    expect(ids(moveItem(all, v, "e", 1))).toBe("abecd"); // before c
    expect(ids(moveItem(all, v, "a", 2))).toBe("bcdea"); // after e (end)
    expect(ids(moveItem(all, v, "a", 1))).toBe("bcdae"); // before e
  });

  it("clamps the target index and ignores unknown ids", () => {
    const v = ["a", "b", "c", "d", "e"];
    expect(ids(moveItem(all, v, "a", 99))).toBe("bcdea");
    expect(ids(moveItem(all, v, "zz", 1))).toBe("abcde");
  });

  it("does not mutate input", () => {
    moveItem(all, ["a", "b"], "a", 1);
    expect(ids(all)).toBe("abcde");
  });
});
