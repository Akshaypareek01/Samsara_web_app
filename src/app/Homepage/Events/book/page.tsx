"use client";

import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Home,
  Lightbulb,
  Lock,
  Share2,
  Timer,
  UserPlus,
  Users,
  Wifi,
  GraduationCap,
  Star,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BASE_URL } from "../../../../lib/utils";
import { getCookie } from "cookies-next";

interface TeacherQualification {
  title: string;
  subtitle: string;
  year: string;
}

interface TeacherImage {
  _id: string;
  filename: string;
  path: string;
  key: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  teacherCategory: string;
  expertise: string[];
  teachingExperience: string;
  qualification: TeacherQualification[];
  additional_courses: string[];
  achievements: string[];
  images: TeacherImage[];
  image: TeacherImage;
}

interface Student {
  _id: string;
  email: string;
  name: string;
}

interface EventDetails {
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
  endTime?: string;
  type: string;
  teacher: Teacher;
  students: Student[];
  status: boolean;
  description?: string;
  meeting_number?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  AboutMe?: string;
  notificationToken?: string;
  favoriteClasses?: string[];
  favoriteEvents?: string[];
  favoriteTeachers?: string[];
  teacherCategory?: string;
  attendance?: string[];
  classFeedback?: string[];
  images?: string[];
}

function EventsPageContent() {
  const searchParams = useSearchParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Get event ID from URL or use default
  const eventId = searchParams.get("eventId");



  // Fetch user profile to get userId
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
    if (!userProfile?._id || !eventDetails?._id) {
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
          userId: userProfile._id.toString(),
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

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Calculate duration in minutes
  const calculateDuration = () => {
    if (!eventDetails?.startTime || !eventDetails?.endTime) return "75 minutes";

    const start = new Date(`2000-01-01T${eventDetails.startTime}`);
    const end = new Date(`2000-01-01T${eventDetails.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);

    return `${diffMins} minutes`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if user is already enrolled
  const isUserEnrolled = () => {
    if (!userProfile?._id || !eventDetails?.students) return false;
    return eventDetails.students.some(
      (student) => student._id === userProfile._id,
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading event details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !eventDetails) {
    return (
      <div className="flex justify-center items-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-500">
              Error: {error || "Event not found"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4">
          {/* Left side: Host image and title */}
          <div className="flex items-center gap-4">
            <div className="relative w-[60px] h-[60px] rounded-full shadow-md ring-2 ring-white overflow-hidden">
              <Image
                src={
                  eventDetails.teacher?.image?.path?.trim()
                    ? eventDetails.teacher.image.path
                    : "https://images.unsplash.com/photo-1607746882042-944635dfe10e"
                }
                alt={eventDetails.teacher?.name || "Host"}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {eventDetails.eventName}
              </h2>
              <p className="text-gray-600 text-sm">
                {eventDetails.details ||
                  "Join our virtual sanctuary for a guided session"}
              </p>
            </div>
          </div>

          {/* Right side: Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 text-sm">
              <Share2 size={16} /> Share
            </button>
            {isUserEnrolled() ? (
              <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm shadow cursor-not-allowed">
                ✅ Already Enrolled
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded-md text-sm shadow cursor-pointer ${registering
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? "Registering..." : "📅 Register Now"}
              </button>
            )}
          </div>
        </div>

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
                {formatDate(eventDetails.startDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {eventDetails.startTime} -{" "}
                {eventDetails.endTime || "8:45 AM"}
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" /> {calculateDuration()}
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
                "Experience deep relaxation and inner peace from the comfort of your home. This virtual meditation session combines ancient wisdom with modern mindfulness techniques, creating a unique journey of self-discovery and tranquility. Perfect for both beginners and experienced practitioners, our guided session will help you develop a stronger mind-body connection and establish a regular meditation practice."}
            </p>
          </div>

          {/* Your Host */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3">Your Host</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-[50px] h-[50px] rounded-full shadow-md ring-2 ring-white overflow-hidden">
                <Image
                  src={
                    eventDetails.teacher?.image?.path ||
                    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&q=80"
                  }
                  alt={eventDetails.teacher?.name || "Host"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {eventDetails.teacher?.name || "Unknown Host"}
                </p>
                <p className="text-xs text-gray-500">
                  {eventDetails.teacher?.teacherCategory ||
                    "Certified Instructor & Wellness Coach"}
                </p>
                <p className="text-xs text-gray-500">
                  {eventDetails.teacher?.teachingExperience} years experience
                </p>
              </div>
            </div>

            {/* Teacher Expertise */}
            {eventDetails.teacher?.expertise &&
              eventDetails.teacher.expertise.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {eventDetails.teacher.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Teacher Qualifications */}
            {eventDetails.teacher?.qualification &&
              eventDetails.teacher.qualification.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Qualifications</h4>
                  <div className="space-y-1">
                    {eventDetails.teacher.qualification.map((qual, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <GraduationCap className="w-3 h-3" />
                        <span>
                          {qual.title} - {qual.subtitle} ({qual.year})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Enrolled Students Section */}
        {eventDetails.students && eventDetails.students.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3">
              Enrolled Students ({eventDetails.students.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventDetails.students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-600">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
