/** Day-chip labels used on Events / Group listings. */
export const DAY_CHIPS = ["All", "Today", "Tomorrow", "This Week"] as const;
export type DayChip = (typeof DAY_CHIPS)[number];

/**
 * Formats a Date as local YYYY-MM-DD.
 * @param date - Date to format
 */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses an ISO/date string to a local YYYY-MM-DD key, or null.
 * @param raw - Date string from API
 */
export function parseLocalDateKey(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return toLocalDateKey(date);
}

/**
 * Local calendar week bounds (Sunday 00:00 → Saturday 23:59:59.999).
 * @param now - Reference date (defaults to now)
 */
export function getCalendarWeekBounds(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Whether a date string falls in the local Sun–Sat week of `now`.
 * @param raw - Event/class start date
 * @param now - Reference date
 */
export function isInThisWeek(raw: string | undefined | null, now = new Date()): boolean {
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;
  const { start, end } = getCalendarWeekBounds(now);
  return date >= start && date <= end;
}

/**
 * Matches a date against All / Today / Tomorrow / This Week chips.
 * @param raw - Date string
 * @param chip - Selected day chip
 * @param now - Reference date
 */
export function matchesDayChip(
  raw: string | undefined | null,
  chip: string,
  now = new Date()
): boolean {
  if (chip === "All") return true;
  const key = parseLocalDateKey(raw);
  if (chip === "This Week") return isInThisWeek(raw, now);
  if (!key) return false;
  const today = toLocalDateKey(now);
  if (chip === "Today") return key === today;
  if (chip === "Tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return key === toLocalDateKey(tomorrow);
  }
  return true;
}

/**
 * Case-insensitive text match against one or more fields.
 * @param query - Search string
 * @param fields - Values to search
 */
export function matchesSearch(query: string, fields: Array<string | undefined | null>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}
