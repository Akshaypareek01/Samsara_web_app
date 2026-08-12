import { getRefId, getUserId } from "@/lib/userId";
import Cookies from "js-cookie";

/**
 * Reads the auth user object from the cookie (sync — avoids profile-load race).
 */
export function getCookieUser(): {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
} | null {
  try {
    const raw = Cookies.get("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * True when `user` owns the resource identified by `teacherRef`
 * (class/event host). Compares stringified Mongo ids.
 * @param user - Cookie/profile user (`_id` or `id`)
 * @param teacherRef - Teacher id string or populated teacher object
 */
export function isOwnResource(
  user: { _id?: string; id?: string } | null | undefined,
  teacherRef: string | { _id?: string; id?: string } | null | undefined
): boolean {
  const userId = getUserId(user);
  const teacherId = getRefId(teacherRef);
  return !!(userId && teacherId && String(userId) === String(teacherId));
}

/**
 * Ownership check: prefer loaded profile over cookie (avoids stale teacher cookie
 * marking a student as host after role switch).
 */
export function isOwnResourceWithCookie(
  profile: { _id?: string; id?: string } | null | undefined,
  teacherRef: string | { _id?: string; id?: string } | null | undefined
): boolean {
  if (getUserId(profile)) {
    return isOwnResource(profile, teacherRef);
  }
  return isOwnResource(getCookieUser(), teacherRef);
}

type RoleUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
} | null | undefined;

/**
 * Resolves consumer role from profile, falling back to cookie.
 * If profile is loaded and says `user`, never trust a stale teacher cookie.
 * @param profile - Loaded /users/profile payload
 */
export function getEffectiveRole(profile?: RoleUser): string | null {
  if (profile && typeof profile.role === "string" && profile.role.length > 0) {
    return String(profile.role);
  }
  // Profile loaded without role but with an id → treat as non-teacher unless cookie says teacher
  if (profile && getUserId(profile)) {
    return getCookieUser()?.role ?? null;
  }
  return getCookieUser()?.role ?? null;
}

/**
 * Host Zoom join is teachers only — never students (`role: user`).
 * When profile explicitly has role `user`, always false (ignore stale teacher cookie).
 * @param profile - Loaded profile (preferred)
 * @param teacherRef - Class/event teacher ref
 */
export function canJoinAsHost(
  profile: RoleUser,
  teacherRef: string | { _id?: string; id?: string } | null | undefined
): boolean {
  if (profile && profile.role === "user") {
    return false;
  }
  const role = getEffectiveRole(profile);
  if (role !== "teacher") return false;
  return isOwnResourceWithCookie(profile, teacherRef);
}

/**
 * Writes a slim auth user cookie from a live profile (clears stale teacher cookies).
 * @param profile - User profile from /users/profile
 */
export function syncUserCookieFromProfile(profile: {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
}): void {
  const slimUser = {
    id: profile.id || profile._id,
    _id: profile._id || profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    profileImage: profile.profileImage,
  };
  Cookies.set("user", JSON.stringify(slimUser), {
    expires: 7,
    path: "/",
    sameSite: "lax",
  });
}
