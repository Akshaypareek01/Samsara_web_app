"use client";

import { useEffect, useId, useRef } from "react";
import { CheckCheck, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import {
  formatNotificationTime,
  notificationHref,
  type AppNotification,
} from "@/lib/notificationApi";

type NotificationDrawerProps = {
  open: boolean;
  notifications: AppNotification[];
  loading: boolean;
  markingAll: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onOpenItem: (item: AppNotification) => void;
};

/**
 * Right-side inbox drawer for student and wellness-coach notifications.
 */
export default function NotificationDrawer({
  open,
  notifications,
  loading,
  markingAll,
  onClose,
  onMarkAllRead,
  onOpenItem,
}: NotificationDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (!open) return;

    /**
     * Closes the drawer on Escape.
     */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close notifications"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col outline-none animate-fadeIn"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-[#ed662e] hover:bg-[#fff4ef] disabled:opacity-40 disabled:hover:bg-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
              aria-label="Mark all notifications as read"
            >
              <CheckCheck size={14} aria-hidden />
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16" role="status">
              <div
                className="w-8 h-8 rounded-full border-2 border-[#ed662e] border-t-transparent animate-spin"
                aria-label="Loading notifications"
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5">
              <EmptyState message="No notifications yet." />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((item) => {
                const href = notificationHref(item.actionUrl);
                return (
                  <li key={item._id}>
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className={`w-full text-left px-5 py-4 transition focus:outline-none focus-visible:bg-[#fff4ef] ${
                        item.isRead
                          ? "bg-white hover:bg-gray-50"
                          : "bg-[#fff8f4] hover:bg-[#fff4ef]"
                      }`}
                      aria-label={`${item.title}. ${item.isRead ? "Read" : "Unread"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                            item.isRead ? "bg-transparent" : "bg-[#ed662e]"
                          }`}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-900 leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                              {formatNotificationTime(item.createdAt)}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm text-gray-600 leading-relaxed">
                            {item.message}
                          </span>
                          {href ? (
                            <span className="mt-2 inline-block text-xs font-medium text-[#ed662e]">
                              {item.actionText || "View"}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
