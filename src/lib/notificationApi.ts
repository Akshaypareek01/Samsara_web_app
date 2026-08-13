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
};

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
 * Maps API actionUrl paths onto consumer-web routes.
 * @param actionUrl Backend action URL
 */
export function notificationHref(actionUrl?: string | null): string | null {
  if (!actionUrl) return null;
  if (actionUrl.startsWith("/Homepage")) return actionUrl;
  const classMatch = actionUrl.match(/\/classes\/([a-f0-9]{24})/i);
  if (classMatch) return `/Homepage/Classes/${classMatch[1]}`;
  const eventMatch = actionUrl.match(/\/events\/([a-f0-9]{24})/i);
  if (eventMatch) return `/Homepage/Events/${eventMatch[1]}`;
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
