type StudentRef =
  | string
  | number
  | { _id?: string; id?: string; name?: string }
  | null
  | undefined;

/**
 * True when `userId` is already in an event students list.
 * Students may be id strings (details payload) or populated objects.
 * @param students - Event students field
 * @param userId - Current user id
 */
export function isViewerRegistered(
  students: StudentRef[] | null | undefined,
  userId: string | null | undefined
): boolean {
  if (!userId || !Array.isArray(students)) return false;
  const uid = String(userId);
  return students.some((student) => {
    if (student == null) return false;
    if (typeof student === "string" || typeof student === "number") {
      return String(student) === uid;
    }
    const sid = student._id || student.id;
    return sid != null && String(sid) === uid;
  });
}
