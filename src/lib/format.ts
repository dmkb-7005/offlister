/** "12 Oct · 14:30", or "12 Oct 2025 · 14:30" for an earlier/other year. */
export function formatTimestamp(ts: number, now: number = Date.now(), locale = "en-GB"): string {
  const d = new Date(ts);
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  const date = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(d);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return `${date.replace(/\./g, "")} · ${time}`;
}
