"use client";

import Image from "next/image";
import { Calendar, Users, BookOpen, Crown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/formatDisplayDate";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import PortalCard from "@/components/PortalCard";
import LetterAvatar from "@/components/LetterAvatar";

type ClassItem = {
  _id: string;
  title?: string;
  startDate?: string;
  schedule?: string;
  image?: string;
  availableseats?: number;
  teacher?: { name?: string; profileImage?: string };
};

type EventItem = {
  _id: string;
  eventName?: string;
  startDate?: string;
  startTime?: string;
  image?: string;
  teacher?: { name?: string; profileImage?: string };
};

/**
 * Reads a display name from the user cookie for the welcome banner.
 */
function getCookieUserName(): string {
  try {
    const raw = Cookies.get("user");
    if (!raw) return "";
    const u = JSON.parse(raw) as { name?: string };
    return u?.name?.trim() || "";
  } catch {
    return "";
  }
}

/**
 * Consumer home — company-style orange welcome + feed cards.
 */
export default function WellnessDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(getCookieUserName());

    /**
     * Loads upcoming classes and events for the home snippets.
     */
    const load = async () => {
      const token = Cookies.get("accessToken");
      try {
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [classesRes, eventsRes, profileRes] = await Promise.all([
          fetch(`${BASE_URL}/classes/upcoming`, { headers }),
          fetch(`${BASE_URL}/events/upcoming`, { headers }),
          token
            ? fetch(`${BASE_URL}/users/profile`, { headers })
            : Promise.resolve(null),
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          const list = (data.data || data || []) as ClassItem[];
          setClasses(Array.isArray(list) ? list.slice(0, 3) : []);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const list = (data.data || data.events || data || []) as EventItem[];
          setEvents(Array.isArray(list) ? list.slice(0, 3) : []);
        }

        if (profileRes && profileRes.ok) {
          const data = await profileRes.json();
          const u = data.data || data;
          if (u?.name) setUserName(String(u.name).trim());
        }
      } catch (err) {
        console.error("Home feed load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const greetingName = userName || "there";

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full space-y-5">
      {/* Orange welcome banner */}
      <section
        className="relative overflow-hidden rounded-2xl bg-[#ff9468] shadow-[0_4px_20px_rgba(255,148,104,0.35)] px-5 py-5 sm:px-7 sm:py-6"
        aria-label="Welcome"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-8 items-center">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-white leading-tight mb-2">
              Welcome back, {greetingName}!
            </h1>
            <p className="text-sm sm:text-[15px] text-white/90 leading-relaxed max-w-xl mb-5">
              Browse group classes, register for events, manage membership, and
              join live sessions from here.
            </p>
            <div className="flex flex-wrap gap-2" aria-label="Quick links">
              <QuickLink
                label="My Classes"
                icon={<BookOpen size={14} aria-hidden />}
                onClick={() => router.push("/Homepage/Classes")}
              />
              <QuickLink
                label="Group Classes"
                icon={<Users size={14} aria-hidden />}
                onClick={() => router.push("/Homepage/Group")}
              />
              <QuickLink
                label="Events"
                icon={<Calendar size={14} aria-hidden />}
                onClick={() => router.push("/Homepage/Events")}
              />
              <QuickLink
                label="Membership"
                icon={<Crown size={14} aria-hidden />}
                onClick={() => router.push("/Homepage/Membership")}
              />
            </div>
          </div>
          <div
            className="hidden md:block w-[220px] h-[160px] relative shrink-0"
            aria-hidden="true"
          >
            <Image
              src="/images/room.svg"
              alt=""
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeedCard
          title="Upcoming Events"
          loading={loading}
          emptyLabel="No upcoming events"
          onSeeAll={() => router.push("/Homepage/Events")}
          items={events.map((e) => ({
            id: e._id,
            label: e.eventName || "Event",
            sub: [
              formatDisplayDate(e.startDate),
              e.startTime ? e.startTime : null,
            ]
              .filter(Boolean)
              .join(" · "),
            teacherName: e.teacher?.name,
            teacherImage: e.teacher?.profileImage,
            onClick: () => router.push(`/Homepage/Events/${e._id}`),
          }))}
        />
        <FeedCard
          title="Group Classes"
          loading={loading}
          emptyLabel="No upcoming classes"
          onSeeAll={() => router.push("/Homepage/Group")}
          items={classes.map((c) => ({
            id: c._id,
            label: c.title || "Class",
            sub: formatDisplayDate(c.schedule || c.startDate, {
              withTime: true,
              fallback:
                c.availableseats != null
                  ? `${c.availableseats} seats`
                  : "Open for registration",
            }),
            teacherName: c.teacher?.name,
            teacherImage: c.teacher?.profileImage,
            onClick: () =>
              router.push(`/Homepage/Group/Details?classId=${c._id}`),
          }))}
        />
      </div>

      <p className="text-center text-xs text-gray-400 pt-2 pb-4">
        Copyright© 2026 Samsara Wellness. All rights reserved. Powered by
        Samsaraa WellTek Pvt Ltd
      </p>
    </div>
  );
}

/**
 * White pill quick-nav chip on the orange banner.
 */
function QuickLink({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#c2410c] px-3.5 py-2 text-xs font-bold shadow-[0_4px_10px_rgba(0,0,0,0.18)] hover:-translate-y-px transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <span className="text-[#f97316]" aria-hidden>
        {icon}
      </span>
      {label}
    </button>
  );
}

type FeedItem = {
  id: string;
  label: string;
  sub: string;
  teacherName?: string;
  teacherImage?: string;
  onClick: () => void;
};

/**
 * Home feed card with live items and View All.
 */
function FeedCard({
  title,
  items,
  loading,
  emptyLabel,
  onSeeAll,
}: {
  title: string;
  items: FeedItem[];
  loading: boolean;
  emptyLabel: string;
  onSeeAll: () => void;
}) {
  return (
    <PortalCard className="p-4 space-y-3">
      <SectionHeader title={title} onAction={onSeeAll} />
      <div className="space-y-1.5 min-h-[88px]">
        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-[#fff4ef] animate-pulse"
              />
            ))}
          </div>
        ) : null}
        {!loading && items.length === 0 ? (
          <EmptyState message={emptyLabel} className="p-5" />
        ) : null}
        {!loading &&
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-3 text-left hover:bg-[#fff4ef]/80 rounded-lg py-2 px-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
            >
              <LetterAvatar
                name={item.teacherName || item.label}
                src={item.teacherImage}
                size={36}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-800 truncate">
                  {item.label}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {item.sub}
                </span>
              </span>
            </button>
          ))}
      </div>
    </PortalCard>
  );
}
