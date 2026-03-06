"use client";

import Image from "next/image";
import { Calendar, User, Clock, ArrowLeft, Users, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
    profileImage: string;
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
    if (!eventData?._id || !userProfile?._id) return;

    const check = async () => {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${BASE_URL}/events/enrollment/${eventData._id}/${userProfile._id}`,
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

  const handleJoinEvent = async () => {
    if (!eventData) return;

    setJoiningEvent(true);

    try {
      // Check if meeting number exists
      if (!eventData.meeting_number) {
        alert("Event Not Started - No meeting number available");
        setJoiningEvent(false);
        return;
      }

      // Create Zoom meeting URL
      const ZoomMeetingNumber = {
        number: eventData.meeting_number,
        pass: eventData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
        eventId: eventData._id || "",
      };

      console.log("Event Data ===>", ZoomMeetingNumber);

      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);

      // Navigate to webview page with meeting data
      router.push(
        `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(zoomMeetingNumberString)}`,
      );
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Error opening event. Please try again.");
    } finally {
      setJoiningEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error: {error || "Event not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-white">
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
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Instructor</h3>
              <div className="flex items-start space-x-4">
                <Image
                  src={eventData.teacher.profileImage}
                  alt={eventData.teacher.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
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
                      {new Date(eventData.startDate).toLocaleDateString()}
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

            {/* Join Button */}
            {/* {eventData.status && (
              <div className="sticky top-4">
                <button
                  onClick={handleJoinEvent}
                  disabled={joiningEvent}
                  className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joiningEvent ? "Joining..." : "Join Event"}
                </button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  {eventData.students.length} participants enrolled
                </p>
              </div>
            )} */}

            {/* Event Action Button */}
            <div className="sticky top-4">
              {!isEnrolled ? (
                <>
                  <button
                    onClick={() =>
                      router.push(
                        `/Homepage/Events/book?eventId=${eventData._id}`,
                      )
                    }
                    className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl text-lg font-semibold"
                  >
                    Register
                  </button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {eventData.students.length} participants enrolled
                  </p>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    You&apos;re already registered
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This event is in your list. Registered events are available
                    in <strong>My Events</strong> — join the event from there
                    when it starts.
                  </p>
                  {eventData.status && eventData.meeting_number && (
                    <button
                      onClick={handleJoinEvent}
                      disabled={joiningEvent}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 mb-3"
                    >
                      {joiningEvent ? "Joining..." : "Join Event"}
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/Homepage/Events")}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                  >
                    Go to My Events
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
