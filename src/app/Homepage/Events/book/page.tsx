"use client";

import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Home,
  Lightbulb,
  Lock,
  Timer,
  UserPlus,
  Users,
  Wifi,
  Star,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BASE_URL } from "../../../../lib/utils";
import { getUserId } from "@/lib/userId";
import { canJoinAsHost, isOwnResourceWithCookie } from "@/lib/isOwnHost";
import { getCookie } from "cookies-next";
import EventBookHostPanel from "./EventBookHostPanel";
import HostActionPanel from "@/components/HostActionPanel";
import LetterAvatar from "@/components/LetterAvatar";
import EventBookEnrolled from "./EventBookEnrolled";
import {
  EventDetails,
  UserProfile,
  calculateEventDuration,
  formatEventDate,
  getHostImageUrl,
} from "./eventBookTypes";

function EventsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [joiningHost, setJoiningHost] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const eventId = searchParams.get("eventId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) {
          setError("No access token found");
          return;
        }

        const response = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();

        const user = data.data || data;

        setUserProfile({
          ...user,
          _id: user._id || user.id
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user profile",
        );
      }
    };

    fetchUserProfile();
  }, []);



  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = getCookie("accessToken");

        const response = await fetch(`${BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }

        const data = await response.json();
        setEventDetails(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (!eventId) {
    return <div className="p-6">Event ID missing</div>;
  }

  // Register for event
  const handleRegister = async () => {
    if (isOwnResourceWithCookie(userProfile, eventDetails?.teacher)) {
      showToast("You are the host of this event", "error");
      return;
    }
    const userId = getUserId(userProfile);
    if (!userId || !eventDetails?._id) {
      showToast("User or event information not available", "error");
      return;
    }

    setRegistering(true);
    try {
      const accessToken = getCookie("accessToken");

      const response = await fetch(`${BASE_URL}/events/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventDetails._id.toString(),
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register for event");
      }

      await response.json();
      showToast("Successfully registered for the event!", "success");

      // Refresh event details to show updated enrollment
      setTimeout(() => {
        window.location.href = "/Homepage/Events";
      }, 1500);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to register for event",
        "error",
      );
    } finally {
      setRegistering(false);
    }
  };

  /**
   * Shows a short-lived toast notification.
   */
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  /**
   * True when the current user is already in the event students list.
   */
  const isUserEnrolled = () => {
    const userId = getUserId(userProfile);
    if (!userId || !eventDetails?.students) return false;
    return eventDetails.students.some(
      (student) => String(student._id) === userId,
    );
  };

  const isEventHost = canJoinAsHost(userProfile, eventDetails?.teacher);
  const hostImageUrl = getHostImageUrl(eventDetails?.teacher);

  /**
   * Opens ZoomWebView as event host (role:1). Students cannot host.
   */
  const handleJoinAsHost = () => {
    if (!canJoinAsHost(userProfile, eventDetails?.teacher)) {
      showToast("Only the event host can join as host", "error");
      return;
    }
    if (!eventDetails?.meeting_number) return;
    setJoiningHost(true);
    try {
      const payload = {
        number: eventDetails.meeting_number,
        pass: eventDetails.password || "",
        userName: userProfile?.name || "Host",
        email: userProfile?.email || "",
        eventId: eventDetails._id || "",
        role: 1,
      };
      router.push(
        `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(JSON.stringify(payload))}`,
      );
    } catch (err) {
      console.error("Error joining as host", err);
      showToast("Failed to open meeting", "error");
    } finally {
      setJoiningHost(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg" role="status">
        Loading event details...
      </div>
    );
  }

  if (error || !eventDetails) {
    return (
      <div className="p-10 text-center text-lg text-red-500" role="alert">
        Error: {error || "Event not found"}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-orange-100/60 shadow-sm p-4 sm:p-6 space-y-6">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
              }`}
          >
            {toast.message}
          </div>
        )}

        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src={eventDetails.image?.trim() ? eventDetails.image : "/images/peoples.svg"}
            alt={eventDetails.eventName}
            fill
            className="brightness-[0.6] rounded-lg object-cover"
          />
        </div>

        {/* Host Info and Buttons Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LetterAvatar
              name={eventDetails.teacher?.name || "Host"}
              src={
                hostImageUrl.includes("/images/logo.svg")
                  ? undefined
                  : hostImageUrl
              }
              size={56}
              className="ring-2 ring-orange-100"
            />

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {eventDetails.eventName}
              </h2>
              <p className="text-gray-500 text-sm line-clamp-2">
                {eventDetails.details ||
                  "Join our virtual sanctuary for a guided session"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {isEventHost ? (
              <span className="inline-flex items-center rounded-full border border-[#ffe0d0] bg-[#fff4ef] px-3 py-2 text-xs font-semibold text-[#c95520]">
                Your event
              </span>
            ) : isUserEnrolled() ? (
              <button
                type="button"
                disabled
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-not-allowed min-h-[44px]"
              >
                Already enrolled
              </button>
            ) : (
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors ${
                  registering
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#ed662e] hover:bg-[#c95520] text-white"
                }`}
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? "Registering…" : "Register now"}
              </button>
            )}
          </div>
        </div>

        {isEventHost ? (
          <div className="mt-6">
            <HostActionPanel
              hasMeeting={!!eventDetails.meeting_number}
              showStart={false}
              joining={joiningHost}
              onJoinAsHost={handleJoinAsHost}
              hint="When the live meeting is ready, join as host to run the session."
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Live Stream */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  fill="#2563eb"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 16.5l6-4.5-6-4.5v9z" />
                  <path d="M22 3H2v18h20V3zm-2 16H4V5h16v14z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  {eventDetails.eventmode === "online"
                    ? "Live Stream"
                    : "In-Person"}
                </h4>
                <p className="text-xs text-gray-500">
                  {eventDetails.eventmode === "online"
                    ? "Samsara Platform"
                    : eventDetails.location}
                </p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />{" "}
                {formatEventDate(eventDetails.startDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {eventDetails.startTime} -{" "}
                {eventDetails.endTime || "8:45 AM"}
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />{" "}
                {calculateEventDuration(
                  eventDetails.startTime,
                  eventDetails.endTime,
                )}
              </div>
              {eventDetails.meeting_number && (
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> Meeting:{" "}
                  {eventDetails.meeting_number}
                </div>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Capacity</h4>
                <p className="text-xs text-gray-500">Limited Spots</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> {eventDetails.availableseats}{" "}
                Spots Left
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Max{" "}
                {parseInt(eventDetails.availableseats) +
                  (eventDetails.students?.length || 0)}{" "}
                people
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />{" "}
                {eventDetails.level || "All Levels Welcome"}
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />{" "}
                {eventDetails.students?.length || 0} Enrolled
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  fill="#f59e0b"
                  viewBox="0 0 24 24"
                >
                  <path d="M11 9h2v5h-2zm0 6h2v2h-2z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Requirements</h4>
                <p className="text-xs text-gray-500">What You Need</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              {eventDetails.eventmode === "online" ? (
                <>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" /> Stable internet connection
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" /> Quiet space
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Headphones recommended
                  </div>
                  {eventDetails.password && (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password:{" "}
                      {eventDetails.password}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" /> Comfortable clothing
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Arrive 10 minutes early
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Bring water bottle
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* About This Event */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">About This Event</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {eventDetails.description ||
                eventDetails.details ||
                "Join this session for guided practice and community connection."}
            </p>
          </div>

          <EventBookHostPanel
            teacher={eventDetails.teacher}
            hostImageUrl={hostImageUrl}
          />
        </div>

        <EventBookEnrolled students={eventDetails.students || []} />
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
