"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import { isOwnResource } from "@/lib/isOwnHost";
import {
  DAY_CHIPS,
  isUpcomingListing,
  matchesDayChip,
  matchesSearch,
} from "@/lib/listingFilters";
import EmptyState from "@/components/EmptyState";
import ListingFilterBar from "@/components/ListingFilterBar";
import SectionHeader from "@/components/SectionHeader";
import EventListingCard, { ListingEvent } from "./components/EventListingCard";
import { formatDisplayDate } from "@/lib/formatDisplayDate";
import { isViewerRegistered } from "@/lib/eventRegistration";

type Event = ListingEvent & {
  details: string;
  eventmode: string;
  level: string;
  location: string;
  students?: { name: string }[];
  meeting_number?: string;
  password?: string;
  endTime?: string;
};

/**
 * Events listing — online/offline grids, filters, and My Events.
 */
export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeAllOnline, setSeeAllOnline] = useState(false);
  const [seeAllOffline, setSeeAllOffline] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loadingUserEvents, setLoadingUserEvents] = useState(true);
  const [userEventsError, setUserEventsError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [cookieUser, setCookieUser] = useState<{
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  } | null>(null);
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    setCookieUser(user);
    const id = user?._id || user?.id;
    if (id) setUserId(id);
    if (user?.name || user?.email) {
      setUserProfile({ name: user.name, email: user.email });
    }
  }, []);

  useEffect(() => {
    if (!userId || userProfile?.name) return;
    const token = Cookies.get("accessToken");
    if (!token) return;
    fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const u = data?.data || data;
        if (u?.name || u?.email) setUserProfile({ name: u.name, email: u.email });
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
      });
  }, [userId, userProfile?.name]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserEvents = async () => {
      setLoadingUserEvents(true);
      setUserEventsError("");
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(
          `${BASE_URL}/events/user-events/${userId}/upcoming`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) {
          setUserEventsError("Failed to fetch your events");
          return;
        }
        const data = await res.json();
        let eventsArray: Event[] = [];
        if (Array.isArray(data)) eventsArray = data;
        else if (Array.isArray(data.events)) eventsArray = data.events;
        else if (Array.isArray(data.data)) eventsArray = data.data;
        setUserEvents(eventsArray);
      } catch {
        setUserEventsError("Network error");
      } finally {
        setLoadingUserEvents(false);
      }
    };
    fetchUserEvents();
  }, [userId]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(`${BASE_URL}/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Failed to fetch events");
          return;
        }
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const levelOptions = useMemo(() => {
    const levels = Array.from(
      new Set(events.map((e) => e.level).filter(Boolean)),
    );
    return levels.length > 0 ? ["All", ...levels] : [];
  }, [events]);

  const typeOptions = useMemo(() => {
    const types = Array.from(
      new Set(events.map((e) => e.type).filter(Boolean)),
    );
    return types.length > 0 ? ["All", ...types] : [];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!isUpcomingListing(event.startDate, event.endTime)) return false;
      if (!matchesDayChip(event.startDate, selectedFilter)) return false;
      if (
        !matchesSearch(searchQuery, [
          event.eventName,
          event.details,
          event.teacher?.name,
          event.location,
        ])
      ) {
        return false;
      }
      if (levelFilter !== "All" && event.level !== levelFilter) return false;
      if (typeFilter !== "All" && event.type !== typeFilter) return false;
      return true;
    });
  }, [events, selectedFilter, searchQuery, levelFilter, typeFilter]);

  const upcomingUserEvents = useMemo(
    () =>
      userEvents.filter((event) =>
        isUpcomingListing(event.startDate, event.endTime),
      ),
    [userEvents],
  );

  /**
   * Opens Zoom for a registered online event.
   */
  const handleJoinEvent = (eventId: string) => {
    const event = upcomingUserEvents.find((e) => e._id === eventId);
    if (!event?.meeting_number) {
      alert("Event not started yet – no meeting link available");
      return;
    }
    setJoiningEvent(eventId);
    const zoomData = {
      number: event.meeting_number,
      pass: event.password || "",
      userName: userProfile?.name || "User",
      email: userProfile?.email || "",
      eventId: event._id,
    };
    router.push(
      `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(JSON.stringify(zoomData))}`,
    );
    setJoiningEvent(null);
  };

  /**
   * Opens booking unless this user is already on the roster.
   * @param id - Event id
   */
  const handleBook = (id: string) => {
    const event = events.find((item) => item._id === id);
    const already =
      isViewerRegistered(event?.students, userId) ||
      userEvents.some((item) => item._id === id);
    if (already) {
      setNotice("You are already registered for this event.");
      return;
    }
    setNotice("");
    router.push(`/Homepage/Events/book?eventId=${id}`);
  };

  /**
   * Renders a mode section grid or empty/loading/error state.
   */
  const renderGrid = (
    list: Event[],
    emptyMessage: string,
    expanded: boolean,
  ) => {
    if (loading) {
      return (
        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[260px] rounded-xl bg-orange-50/60 animate-pulse"
            />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="col-span-full">
          <EmptyState
            message={error}
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="col-span-full">
          <EmptyState message={emptyMessage} />
        </div>
      );
    }
    const visible = expanded ? list : list.slice(0, 3);
    return visible.map((event) => (
      <EventListingCard
        key={event._id}
        event={event}
        onBook={handleBook}
        isOwn={isOwnResource(cookieUser, event.teacher)}
        isRegistered={
          isViewerRegistered(event.students, userId) ||
          userEvents.some((item) => item._id === event._id)
        }
      />
    ));
  };

  const onlineEvents = filteredEvents.filter((e) => e.eventmode === "online");
  const offlineEvents = filteredEvents.filter((e) => e.eventmode === "offline");

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-orange-100/60 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#ff9468] shadow-[0_4px_20px_rgba(255,148,104,0.3)] px-6 sm:px-8 py-6 sm:py-7">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                Upcoming Events
              </h2>
              <p className="text-sm text-white/90">
                Discover wellness activities and join our community events.
              </p>
            </div>
            <span className="shrink-0 bg-white text-[#c2410c] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {filteredEvents.length} events
            </span>
          </div>
        </div>

        {notice ? (
          <p
            role="alert"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </p>
        ) : null}

        <ListingFilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search events, hosts, locations…"
          onSearchChange={setSearchQuery}
          dayOptions={DAY_CHIPS}
          daySelected={selectedFilter}
          onDaySelect={setSelectedFilter}
          levelOptions={levelOptions}
          levelSelected={levelFilter}
          onLevelSelect={setLevelFilter}
          typeOptions={typeOptions}
          typeSelected={typeFilter}
          onTypeSelect={setTypeFilter}
          typeLabel="Type"
          resultCount={filteredEvents.length}
          resultNoun="event"
          onClear={() => {
            setSearchQuery("");
            setSelectedFilter("All");
            setLevelFilter("All");
            setTypeFilter("All");
          }}
        />

        <section className="space-y-3">
          <SectionHeader
            title="Online Events"
            showAction={onlineEvents.length > 3}
            actionLabel={seeAllOnline ? "Show less" : "See all"}
            onAction={() => setSeeAllOnline((v) => !v)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderGrid(onlineEvents, "No upcoming events.", seeAllOnline)}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Offline Events"
            showAction={offlineEvents.length > 3}
            actionLabel={seeAllOffline ? "Show less" : "See all"}
            onAction={() => setSeeAllOffline((v) => !v)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderGrid(offlineEvents, "No upcoming offline events.", seeAllOffline)}
          </div>
        </section>

        <section className="rounded-xl border border-[#ffe0d0] bg-[#fff4ef]/50 p-4 space-y-3">
          <SectionHeader title="My Events" showAction={false} />
          {loadingUserEvents ? (
            <div className="h-20 rounded-lg bg-[#fff4ef] animate-pulse" />
          ) : userEventsError ? (
            <EmptyState message={userEventsError} />
          ) : upcomingUserEvents.length === 0 ? (
            <EmptyState
              message="No upcoming enrolled events."
              actionLabel="Browse events"
              onAction={() => setSelectedFilter("All")}
            />
          ) : (
            <ul className="space-y-2">
              {upcomingUserEvents.map((event) => (
                <li
                  key={event._id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white rounded-lg border border-orange-50 px-3 py-2.5"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <Image
                      src={event.image || "/images/class1.svg"}
                      alt={event.eventName}
                      width={44}
                      height={44}
                      className="rounded-lg object-cover w-11 h-11 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.eventName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDisplayDate(event.startDate)}
                        {event.startTime ? ` ${event.startTime}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {event.location} · {event.students?.length || 0} enrolled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/Homepage/Events/${event._id}`)
                      }
                      className="text-sm border border-gray-200 px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </button>
                    {event.eventmode === "online" && event.meeting_number ? (
                      <button
                        type="button"
                        onClick={() => handleJoinEvent(event._id)}
                        disabled={joiningEvent === event._id}
                        className="text-sm bg-[#ed662e] text-white px-3 py-1.5 rounded-md hover:bg-[#c95520] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
                      >
                        {joiningEvent === event._id ? "Joining…" : "Join"}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
