"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

type Event = {
  _id: string;
  eventName: string;
  details: string;
  availableseats: string;
  eventmode: string;
  image: string;
  level: string;
  location: string;
  startDate: string;
  startTime: string;
  type: string;
  teacher?: {
    name: string;
    profileImage?: string;
  };
  students?: { name: string }[];
  status?: boolean;
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeAllOnline, setSeeAllOnline] = useState(false);
  const [seeAllOffline, setSeeAllOffline] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loadingUserEvents, setLoadingUserEvents] = useState(true);
  const [userEventsError, setUserEventsError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user profile to get user id
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("accessToken");
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.id) setUserId(data.id);
      } catch {}
    };
    fetchUserProfile();
  }, []);

  // Fetch user events when userId is available
  useEffect(() => {
    if (!userId) return;
    const fetchUserEvents = async () => {
      setLoadingUserEvents(true);
      setUserEventsError("");
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(
          `${BASE_URL}/events/user-events/${userId}/upcoming`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          setUserEventsError("Failed to fetch your events");
          setLoadingUserEvents(false);
          return;
        }
        const data = await res.json();
        let eventsArray = data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (Array.isArray(data.events)) {
            eventsArray = data.events;
          } else if (Array.isArray(data.data)) {
            eventsArray = data.data;
          } else {
            eventsArray = [];
          }
        }
        setUserEvents(eventsArray);
        console.log("userEvents API response:", data);
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
        const res = await fetch(`${BASE_URL}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setError("Failed to fetch events");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setEvents(data);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const onlineEvents = events.filter((e) => e.eventmode === "online");
  const offlineEvents = events.filter((e) => e.eventmode === "offline");

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Events"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-start px-8">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-1">Upcoming Events</h2>
              <p className="text-sm">
                Discover wellness activities and join our community events.
              </p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
            {events.length}+ Events
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <button className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
            All
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Today
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Tomorrow
          </button>
        </div>

        {/* Online Events Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Online Events</h3>
          {onlineEvents.length > 3 && (
            <button
              className="text-orange-500 text-sm font-medium"
              onClick={() => setSeeAllOnline((v) => !v)}
            >
              {seeAllOnline ? "Show Less" : "See All"}
            </button>
          )}
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8">Loading events...</div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-500 py-8">
              {error}
            </div>
          ) : onlineEvents.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No online events found.
            </div>
          ) : (
            (seeAllOnline ? onlineEvents : onlineEvents.slice(0, 3)).map(
              (event) => (
                <div
                  key={event._id}
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white"
                >
                  {/* Card Image */}
                  <div className="relative h-[150px] w-full">
                    <Image
                      src={event.image}
                      alt={event.eventName}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-xl"
                    />
                    {event.status && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Live
                      </div>
                    )}
                  </div>
                  {/* Card Body */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold">{event.eventName}</h4>
                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Image
                        src={event.teacher?.profileImage || "/images/logo.svg"}
                        width={24}
                        height={24}
                        alt={event.teacher?.name || "Instructor"}
                        className="rounded-full object-cover"
                      />
                      <span>with {event.teacher?.name}</span>
                    </div>
                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(event.startDate).toLocaleDateString()}{" "}
                        {event.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {event.type === "free" ? "Free" : "Paid"}
                      </div>
                    </div>
                    {/* Bottom Row */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center text-gray-400 gap-1">
                        <Users size={14} />
                        {event.availableseats} spots left
                      </div>
                      <button
                        className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md hover:bg-orange-600 cursor-pointer"
                        onClick={() => router.push("/Homepage/Events/book")}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ofline Events</h3>
          {offlineEvents.length > 3 && (
            <button
              className="text-orange-500 text-sm font-medium"
              onClick={() => setSeeAllOffline((v) => !v)}
            >
              {seeAllOffline ? "Show Less" : "See All"}
            </button>
          )}
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8">Loading events...</div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-500 py-8">
              {error}
            </div>
          ) : offlineEvents.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No offline events found.
            </div>
          ) : (
            (seeAllOffline ? offlineEvents : offlineEvents.slice(0, 3)).map(
              (event) => (
                <div
                  key={event._id}
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white"
                >
                  {/* Card Image */}
                  <div className="relative h-[150px] w-full">
                    <Image
                      src={event.image}
                      alt={event.eventName}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-xl"
                    />
                    {event.status && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Live
                      </div>
                    )}
                  </div>
                  {/* Card Body */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold">{event.eventName}</h4>
                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Image
                        src={event.teacher?.profileImage || "/images/logo.svg"}
                        width={24}
                        height={24}
                        alt={event.teacher?.name || "Instructor"}
                        className="rounded-full object-cover"
                      />
                      <span>with {event.teacher?.name}</span>
                    </div>
                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(event.startDate).toLocaleDateString()}{" "}
                        {event.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {event.type === "free" ? "Free" : "Paid"}
                      </div>
                    </div>
                    {/* Bottom Row */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center text-gray-400 gap-1">
                        <Users size={14} />
                        {event.availableseats} spots left
                      </div>
                      <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md">
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold">My Events</h3>
            <button className="text-sm text-orange-500 font-medium">
              See All
            </button>
          </div>

          {/* Event List */}
          {loadingUserEvents ? (
            <div className="text-center py-8">Loading events...</div>
          ) : userEventsError ? (
            <div className="text-center text-red-500 py-8">
              {userEventsError}
            </div>
          ) : userEvents.length === 0 ? (
            <div className="text-center py-8">No events scheduled.</div>
          ) : (
            userEvents.map((event) => (
              <div
                key={event._id}
                className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3"
              >
                {/* Left Side */}
                <div className="flex gap-3 items-center">
                  <Image
                    src={event.image}
                    alt={event.eventName}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-medium">{event.eventName}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}{" "}
                      {event.startTime}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>📍 {event.location}</span>
                      <span>👥 {event.students?.length || 0} Enrolled</span>
                    </div>
                  </div>
                </div>
                {/* Right Side Button */}
                <button className="text-sm border px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100">
                  View Details →
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
