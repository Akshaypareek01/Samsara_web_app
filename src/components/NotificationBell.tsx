"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NotificationDrawer from "@/components/NotificationDrawer";
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationHref,
  type AppNotification,
} from "@/lib/notificationApi";

const POLL_MS = 60_000;

/**
 * Header bell that opens the notification drawer for students and coaches.
 */
export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  /**
   * Refreshes the unread badge without opening the drawer.
   */
  const refreshUnread = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn("Failed to load unread notification count", err);
    }
  }, []);

  /**
   * Loads the inbox when the drawer opens.
   */
  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyNotifications();
      setItems(data);
      setUnreadCount(data.filter((item) => !item.isRead).length);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load notifications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const timer = window.setInterval(() => {
      void refreshUnread();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    if (open) void loadInbox();
  }, [open, loadInbox]);

  /**
   * Opens the drawer.
   */
  const handleOpen = () => setOpen(true);

  /**
   * Marks every notification as read.
   */
  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to mark all as read";
      toast.error(message);
    } finally {
      setMarkingAll(false);
    }
  };

  /**
   * Marks one item read and follows its action link when present.
   * @param item Inbox row
   */
  const handleOpenItem = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item._id);
        setItems((prev) =>
          prev.map((row) =>
            row._id === item._id ? { ...row, isRead: true } : row
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err) {
        console.warn("Failed to mark notification as read", err);
      }
    }

    const href = notificationHref(item.actionUrl);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-[#fff4ef] hover:text-[#ed662e] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
      >
        <Bell size={20} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ed662e] text-white text-[10px] font-bold leading-4 text-center">
            {badge}
          </span>
        ) : null}
      </button>
      <NotificationDrawer
        open={open}
        notifications={items}
        loading={loading}
        markingAll={markingAll}
        onClose={() => setOpen(false)}
        onMarkAllRead={handleMarkAll}
        onOpenItem={handleOpenItem}
      />
    </>
  );
}
