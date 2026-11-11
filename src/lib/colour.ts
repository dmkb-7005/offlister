import type { Group, Kind } from "./types";

export const HUES = [0, 28, 52, 90, 140, 175, 205, 230, 265, 300, 330] as const;
export const BG = "#1A1F2B";

/** The hue after `hue` in the palette (wraps; unknown hues restart at 0). */
export function nextHue(hue: number): number {
  const i = HUES.indexOf(hue as (typeof HUES)[number]);
  return HUES[(i + 1) % HUES.length];
}

/** Hue for a new group: the one after the most recently created group of that kind. */
export function hueForNewGroup(groups: readonly Group[], kind: Kind): number {
  const own = groups.filter((g) => g.kind === kind);
  if (own.length === 0) return HUES[0];
  const last = own.reduce((a, b) => (b.createdAt >= a.createdAt ? b : a));
  return nextHue(last.hue);
}

export interface GroupColours {
  chip: string; // header chip background
  onChip: string; // header chip text
  tint: string; // member row background
  text: string; // member row text
}

export function groupColours(hue: number): GroupColours {
  return {
    chip: `hsl(${hue} 70% 70%)`,
    onChip: "#0B1A2E",
    tint: `hsl(${hue} 30% 20%)`,
    text: `hsl(${hue} 80% 85%)`,
  };
}

// --- contrast helpers (WCAG 2.x), used by tests and available to the UI ---

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

export function parseColour(c: string): [number, number, number] {
  const hsl = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(c);
  if (hsl) return hslToRgb(+hsl[1], +hsl[2], +hsl[3]);
  const hex = /^#([0-9a-f]{6})$/i.exec(c);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  throw new Error(`Unsupported colour: ${c}`);
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(parseColour(a));
  const lb = luminance(parseColour(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
