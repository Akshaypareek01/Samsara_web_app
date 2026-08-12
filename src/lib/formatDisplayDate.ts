type FormatDisplayDateOptions = {
  /** Include time when the value parses as a date. */
  withTime?: boolean;
  /** Shown when value is missing or unparseable. */
  fallback?: string;
};

/**
 * Returns true when a string looks like an ISO / API date timestamp.
 * @param value - Candidate date string
 */
function looksLikeIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}/.test(value) ||
    value.includes("T") ||
    /Z$/i.test(value)
  );
}

/**
 * Formats API date/time values for UI display.
 * Never returns raw ISO strings like `2026-08-15T05:36:00.000Z`.
 * Human-readable schedule text (e.g. "Mon / Wed 6pm") is passed through.
 *
 * @param value - ISO string, Date, or free-form schedule text
 * @param options - Formatting options
 * @returns Locale-friendly date/time or fallback
 */
export function formatDisplayDate(
  value?: string | Date | null,
  options: FormatDisplayDateOptions = {},
): string {
  const fallback = options.fallback ?? "Schedule TBA";
  if (value == null || value === "") return fallback;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return fallback;
    return options.withTime
      ? value.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : value.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  }

  const trimmed = String(value).trim();
  if (!trimmed) return fallback;

  if (looksLikeIsoDate(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDisplayDate(parsed, options);
    }
    return fallback;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime()) && /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(trimmed)) {
    return formatDisplayDate(parsed, options);
  }

  return trimmed;
}

/**
 * Formats a date with time — shorthand for `formatDisplayDate(..., { withTime: true })`.
 * @param value - ISO string, Date, or schedule text
 * @param fallback - Optional fallback label
 */
export function formatDisplayDateTime(
  value?: string | Date | null,
  fallback = "Schedule TBA",
): string {
  return formatDisplayDate(value, { withTime: true, fallback });
}
