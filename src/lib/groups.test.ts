import { describe, expect, it } from "vitest";
import { deleteGroup } from "./groups";
import { group, item } from "./test-helpers";
import type { State } from "./types";

describe("deleteGroup", () => {
  it("removes the group and ungroups its items, keeping them", () => {
    const s: State = {
      version: 1,
      sort: "manual",
      groups: [group("A"), group("B")],
      items: [item("x", { groupId: "A" }), item("y", { groupId: "B" }), item("z")],
    };
    const r = deleteGroup(s, "A");
    expect(r.groups.map((g) => g.id)).toEqual(["B"]);
    expect(r.items.map((i) => [i.id, i.groupId])).toEqual([["x", undefined], ["y", "B"], ["z", undefined]]);
    expect("groupId" in r.items[0]).toBe(false);
  });
});
