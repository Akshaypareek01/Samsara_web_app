/** Class fields used to decide if the scheduled end (IST) has passed. */
export type ClassScheduleLike = {
  completedAt?: string | Date | null;
  schedule?: string | Date | null;
  startDate?: string | Date | null;
  date?: string | Date | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  schedules?: Array<{
    date?: string | Date | null;
    startTime?: string | null;
    endTime?: string | null;
  }> | null;
};

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Clock string ("17:14" or "5:14 PM") to minutes since midnight.
 * @param timeStr Stored start/end time
 */
function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10) || 0;
  const amPm = (match[3] || "").toUpperCase();
  if (amPm === "PM" && hours !== 12) hours += 12;
  if (amPm === "AM" && hours === 12) hours = 0;
  if (Number.isNaN(hours)) return null;
  return hours * 60 + minutes;
}

/**
 * IST calendar date (YYYY-MM-DD) for a stored schedule instant.
 * Clock times are local wall times, not UTC.
 * @param date Schedule instant
 */
function istDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * True once the class end (date + end time, Asia/Kolkata) has passed,
 * or the session was marked completed.
 * @param classItem Class or group-class payload
 */
export function isClassScheduleEnded(
  classItem: ClassScheduleLike | null | undefined
): boolean {
  if (!classItem) return false;
  if (classItem.completedAt) return true;

  const dateValue =
    classItem.schedules?.[0]?.date ||
    classItem.schedule ||
    classItem.startDate ||
    classItem.date;
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  let start = classItem.schedules?.[0]?.startTime || classItem.startTime;
  let end = classItem.schedules?.[0]?.endTime || classItem.endTime;
  if (start && String(start).includes("-") && !end) {
    const [startPart, endPart] = String(start).split("-").map((part) => part.trim());
    start = startPart;
    end = endPart;
  }

  let endMinutes = parseTimeToMinutes(end);
  const startMinutes = parseTimeToMinutes(start);
  const duration = Number(classItem.duration);
  if (endMinutes == null && startMinutes != null && Number.isFinite(duration) && duration > 0) {
    endMinutes = startMinutes + duration;
  }
  if (endMinutes == null) return false;

  const [year, month, day] = istDateKey(date).split("-").map(Number);
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  const endUtcMs = Date.UTC(year, month - 1, day, endHour, endMin) - IST_OFFSET_MS;
  return Date.now() >= endUtcMs;
}
