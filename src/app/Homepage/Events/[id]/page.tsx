"use client";

import Image from "next/image";
import { Calendar, User, Clock, ArrowLeft, Users, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { getUserId } from "@/lib/userId";
import { canJoinAsHost } from "@/lib/isOwnHost";
import { useRouter } from "next/navigation";
import EventHostActions from "../components/EventHostActions";
import LetterAvatar from "@/components/LetterAvatar";
import { formatDisplayDate } from "@/lib/formatDisplayDate";

interface EventData {
  _id: string;
  eventName: string;
  details: string;
  type: string;
  level: string;
  startDate: string;
  startTime: string;
  availableseats: string;
  location: string;
  image: string;
  status: boolean;
  meeting_number: string;
  password: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
    teacherCategory: string;
    expertise: string[];
    profileImage?: string;
    logo?: string;
    AboutMe: string;
    gender: string;
    age: string;
    status: boolean;
    active: boolean;
  };
  eventmode: string;
  whoitsfor: string;
  whoitsnotfor: string;
  howItWillHelp: string;
  howItWillnotHelp: string;
  students: Array<{
    _id: string;
    email: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setEventId(resolvedParams.id);
    });
  }, [params]);

  if (!eventId) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return <EventDetailsContent eventId={eventId} />;
}

function EventDetailsContent({ eventId }: { eventId: string }) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningEvent, setJoiningEvent] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    _id: string;
    name?: string;
    email?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) {
          setError("Please login to view event details");
          setLoading(false);
          return;
        }

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
        setEventData(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  //check enrollment
  useEffect(() => {
    const eventIdValue = eventData?._id;
    const userId = getUserId(userProfile);
    if (!eventIdValue || !userId) return;

    const check = async () => {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${BASE_URL}/events/enrollment/${eventIdValue}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        setIsEnrolled(data.enrolled);
      }
    };

    check();
  }, [eventData, userProfile]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) return;

        const response = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // setUserProfile(data);
          setUserProfile(data.data || data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const isHost = canJoinAsHost(userProfile, eventData?.teacher);

  /**
   * Opens Zoom for this event; hosts join with role:1 (forceHost).
   * Students always get role 0 (attendee).
   */
  const handleJoinEvent = async (asHost = false) => {
    if (!eventData) return;

    setJoiningEvent(true);

    try {
      if (!eventData.meeting_number) {
        alert("Event Not Started - No meeting number available");
        setJoiningEvent(false);
        return;
      }

      const hostOk = canJoinAsHost(userProfile, eventData.teacher);
      const ZoomMeetingNumber = {
        number: eventData.meeting_number,
        pass: eventData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
        eventId: eventData._id || "",
        role: hostOk && asHost ? 1 : 0,
      };

      router.push(
        `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(JSON.stringify(ZoomMeetingNumber))}`,
      );
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Error opening event. Please try again.");
    } finally {
      setJoiningEvent(false);
    }
  };

  const teacherAvatar =
    eventData?.teacher?.profileImage || eventData?.teacher?.logo;

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-10 h-10 rounded-full border-2 border-[#ed662e] border-t-transparent animate-spin"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error: {error || "Event not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl md:text-3xl font-semibold">Event Details</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Event Image */}
        <div className="relative mb-8">
          <Image
            src={eventData.image || "/images/room1.svg"}
            alt={eventData.eventName}
            width={800}
            height={400}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <span className="text-sm px-3 py-1 bg-white/90 text-gray-700 rounded-full">
              {eventData.type}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                eventData.status
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {eventData.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Title & Description */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {eventData.eventName}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {eventData.details}
              </p>
            </div>

            {/* Teacher Section */}
            <div className="bg-white rounded-xl border border-orange-100/80 shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Instructor</h3>
              <div className="flex items-start space-x-4">
                <LetterAvatar
                  name={eventData.teacher.name}
                  src={teacherAvatar}
                  size={80}
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {eventData.teacher.name}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    {eventData.teacher.teacherCategory}
                  </p>
                  {eventData.teacher.AboutMe && (
                    <p className="text-gray-600 mb-3">
                      {eventData.teacher.AboutMe}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {eventData.teacher.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* How It Will Help */}
            {eventData.howItWillHelp && eventData.howItWillHelp !== "." && (
              <div>
                <h3 className="text-xl font-semibold mb-4">How It Will Help</h3>
                <p className="text-gray-600 leading-relaxed">
                  {eventData.howItWillHelp}
                </p>
              </div>
            )}

            {/* Who It's For */}
            {eventData.whoitsfor && eventData.whoitsfor !== "." && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Who It&apos;s For
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {eventData.whoitsfor}
                </p>
              </div>
            )}

            {/* Who It's Not For */}
            {eventData.whoitsnotfor && eventData.whoitsnotfor !== "." && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Who It&apos;s Not For
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {eventData.whoitsnotfor}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Event Info & Actions */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Event Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">
                      {formatDisplayDate(eventData.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-600">{eventData.startTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{eventData.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-gray-600">
                      Max {eventData.availableseats} participants
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Enrolled</p>
                    <p className="text-gray-600">
                      {eventData.students.length} participants
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Level</p>
                  <span className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
                    {eventData.level}
                  </span>
                </div>
                <div>
                  <p className="font-medium mb-2">Mode</p>
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {eventData.eventmode}
                  </span>
                </div>
                <div>
                  <p className="font-medium mb-2">Type</p>
                  <span className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded-full">
                    {eventData.type}
                  </span>
                </div>
              </div>
            </div>

            <EventHostActions
              isHost={isHost}
              isEnrolled={isEnrolled}
              meetingNumber={eventData.meeting_number}
              joining={joiningEvent}
              enrolledCount={eventData.students.length}
              eventStatus={eventData.status}
              onJoinAsHost={() => handleJoinEvent(true)}
              onRegister={() =>
                router.push(`/Homepage/Events/book?eventId=${eventData._id}`)
              }
              onJoinAsStudent={() => handleJoinEvent(false)}
              onBack={() => router.push("/Homepage/Events")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
