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
 * Asia/Kolkata calendar day (YYYY-MM-DD).
 * Date-only strings stay literal. Instants use Asia/Kolkata so UTC midnight
 * does not move an event onto the next day.
 * @param raw - Date string from API, or an ISO instant
 */
export function parseLocalDateKey(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const isoDay = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) return `${isoDay[1]}-${isoDay[2]}-${isoDay[3]}`;
  const us = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  const today = parseLocalDateKey(now.toISOString());
  if (chip === "Today") return key === today;
  if (chip === "Tomorrow") {
    if (!today) return false;
    const [y, m, d] = today.split("-").map(Number);
    const tomorrow = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
    return key === tomorrow;
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

type ClockHM = { hours: number; minutes: number };

/**
 * Parses "HH:mm", "H:mm", or "h:mm AM/PM" into 24h hours/minutes.
 * @param raw - Clock string from API
 */
export function parseClockToHM(raw?: string | null): ClockHM | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match12) return null;
  let hours = parseInt(match12[1], 10);
  const minutes = parseInt(match12[2], 10);
  const mer = match12[3].toUpperCase();
  if (mer === "PM" && hours !== 12) hours += 12;
  if (mer === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/**
 * True when a class/event is still upcoming: Kolkata start day is today or later,
 * and if that day is today and an end time is set, that clock has not passed.
 *
 * @param startRaw - ISO start/schedule date
 * @param endTime - Optional end clock (events)
 * @param now - Reference instant
 */
export function isUpcomingListing(
  startRaw: string | undefined | null,
  endTime?: string | null,
  now = new Date(),
): boolean {
  const startKey = parseLocalDateKey(startRaw);
  const todayKey = parseLocalDateKey(now.toISOString());
  if (!startKey || !todayKey) return false;
  if (startKey > todayKey) return true;
  if (startKey < todayKey) return false;

  const endHM = parseClockToHM(endTime);
  if (!endHM) return true;
  const endDt = new Date(now);
  endDt.setHours(endHM.hours, endHM.minutes, 0, 0);
  return now <= endDt;
}
