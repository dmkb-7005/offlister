import { describe, expect, it } from "vitest";
import { BG, HUES, contrast, groupColours, hueForNewGroup, nextHue } from "./colour";
import { group } from "./test-helpers";

describe("hues", () => {
  it("cycles through the palette and wraps", () => {
    expect(nextHue(0)).toBe(28);
    expect(nextHue(330)).toBe(0);
    expect(nextHue(17)).toBe(0);
  });
  it("new groups take the hue after the latest group of the same kind", () => {
    expect(hueForNewGroup([], "todo")).toBe(0);
    const gs = [
      group("a", { hue: 52, createdAt: 1 }),
      group("b", { hue: 140, createdAt: 2 }),
      group("c", { hue: 300, createdAt: 3, kind: "buy" }),
    ];
    expect(hueForNewGroup(gs, "todo")).toBe(175);
    expect(hueForNewGroup(gs, "buy")).toBe(330);
  });
});

describe("group colours are AA-readable", () => {
  for (const h of HUES) {
    it(`hue ${h}`, () => {
      const c = groupColours(h);
      expect(contrast(c.text, c.tint)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.onChip, c.chip)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.text, BG)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
