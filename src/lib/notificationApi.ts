import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

export type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string | null;
  actionText?: string | null;
  metadata?: Record<string, unknown> | null;
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/**
 * Pulls a Mongo id out of a string or `{ _id | id | $oid }` value.
 * @param value Raw metadata field
 */
function asObjectId(value: unknown): string | null {
  if (typeof value === "string" && OBJECT_ID.test(value.trim())) return value.trim();
  if (value && typeof value === "object") {
    const rec = value as { _id?: unknown; id?: unknown; $oid?: unknown };
    return asObjectId(rec.$oid) || asObjectId(rec._id) || asObjectId(rec.id);
  }
  return null;
}

/**
 * Auth headers for notification API calls.
 */
function authHeaders(): HeadersInit {
  const token = Cookies.get("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Loads the signed-in user's inbox.
 */
export async function fetchMyNotifications(): Promise<AppNotification[]> {
  const res = await fetch(`${BASE_URL}/notifications/my-notifications?limit=50`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to load notifications");
  }
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Loads unread inbox count for the badge.
 */
export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to load unread count");
  }
  return Number(data.data?.unreadCount ?? 0);
}

/**
 * Marks a single notification as read.
 * @param id Notification id
 */
export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to mark as read");
  }
}

/**
 * Marks every inbox item as read.
 */
export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to mark all as read");
  }
}

/**
 * Maps API actionUrl / metadata onto consumer-web routes.
 * Prefers metadata.classId so a notification id is never used as the class id.
 * @param actionUrl Backend action URL
 * @param metadata Notification metadata (classId / eventId)
 */
export function notificationHref(
  actionUrl?: string | null,
  metadata?: Record<string, unknown> | null
): string | null {
  const classId =
    asObjectId(metadata?.classId) || asObjectId(metadata?.classid);
  if (classId) return `/Homepage/Classes/${classId}`;

  const eventId =
    asObjectId(metadata?.eventId) || asObjectId(metadata?.eventid);
  if (eventId) return `/Homepage/Events/${eventId}`;

  if (!actionUrl) return null;
  if (actionUrl.startsWith("/Homepage/Classes/") || actionUrl.startsWith("/Homepage/Events/")) {
    return actionUrl;
  }
  const classMatch = actionUrl.match(/\/classes\/([a-f0-9]{24})/i);
  if (classMatch) return `/Homepage/Classes/${classMatch[1]}`;
  const eventMatch = actionUrl.match(/\/events\/([a-f0-9]{24})/i);
  if (eventMatch) return `/Homepage/Events/${eventMatch[1]}`;
  if (actionUrl.startsWith("/Homepage")) return actionUrl;
  return null;
}

/**
 * Relative timestamp for inbox rows.
 * @param iso createdAt ISO string
 */
export function formatNotificationTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
