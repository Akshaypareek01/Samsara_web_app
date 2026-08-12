/**
 * Resolves Mongo user id from cookie/profile payloads that may use `_id` or `id`.
 * @param user - User-like object from API or cookie
 * @returns String id or null
 */
export function getUserId(
  user: { _id?: string; id?: string } | null | undefined
): string | null {
  if (!user) return null;
  const id = user._id || user.id;
  return id ? String(id) : null;
}

/**
 * Resolves a teacher/user ref that may be a string id or populated object.
 * @param ref - Teacher field from class/event documents
 * @returns String id or null
 */
export function getRefId(
  ref: string | { _id?: string; id?: string } | null | undefined
): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  return getUserId(ref);
}
