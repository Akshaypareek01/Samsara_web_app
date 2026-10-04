type CapacityEvent = {
  availableseats?: string | number | null;
  maxCapacity?: string | number | null;
  studentCount?: number | null;
  students?: unknown[] | null;
};

/**
 * Configured event max. `availableseats` is the cap, not seats remaining.
 * @param event - Event payload
 */
export function eventCapacity(event: CapacityEvent | null | undefined): number {
  const raw = event?.availableseats ?? event?.maxCapacity;
  const n = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Enrolled headcount from `studentCount` or the students array.
 * @param event - Event payload
 */
export function eventEnrolledCount(event: CapacityEvent | null | undefined): number {
  const counted = Number(event?.studentCount);
  if (Number.isFinite(counted) && counted >= 0) return counted;
  return Array.isArray(event?.students) ? event.students.length : 0;
}

/**
 * Seats still open: max(0, capacity - enrolled).
 * @param event - Event payload
 */
export function eventSpotsLeft(event: CapacityEvent | null | undefined): number {
  return Math.max(0, eventCapacity(event) - eventEnrolledCount(event));
}
