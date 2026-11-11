import { describe, expect, it } from "vitest";
import { formatTimestamp } from "./format";

const now = new Date(2026, 10, 11, 22, 0).getTime();

describe("formatTimestamp", () => {
  it("omits the year for this year", () => {
    expect(formatTimestamp(new Date(2026, 9, 12, 14, 30).getTime(), now)).toBe("12 Oct · 14:30");
  });
  it("includes the year for other years", () => {
    expect(formatTimestamp(new Date(2025, 9, 12, 14, 30).getTime(), now)).toBe("12 Oct 2025 · 14:30");
  });
  it("uses 24-hour time with leading zeros", () => {
    expect(formatTimestamp(new Date(2026, 0, 3, 7, 5).getTime(), now)).toBe("3 Jan · 07:05");
    expect(formatTimestamp(new Date(2026, 0, 3, 0, 0).getTime(), now)).toBe("3 Jan · 00:00");
  });
});
