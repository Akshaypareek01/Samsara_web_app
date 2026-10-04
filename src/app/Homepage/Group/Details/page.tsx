"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { canJoinAsHost } from "@/lib/isOwnHost";
import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Clock, CalendarDays, Users } from "lucide-react";
import LetterAvatar from "@/components/LetterAvatar";
import { formatDisplayDate } from "@/lib/formatDisplayDate";
import { isClassScheduleEnded } from "@/lib/classScheduleStatus";
import PortalCard from "@/components/PortalCard";
import HostActionPanel from "@/components/HostActionPanel";

interface ClassType {
  _id?: string;
  image?: string;
  title?: string;
  description?: string;
  meeting_number?: string;
  password?: string;
  zoomAccountUsed?: string;
  duration?: number;
  startDate?: string;
  schedule?: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string | null;
  schedules?: Array<{
    date?: string;
    startTime?: string;
    endTime?: string;
  }>;
  availableseats?: number;
  maxSeats?: number;
  maxCapacity?: number;
  students?: unknown[];
  teacher?: {
    _id?: string;
    id?: string;
    name?: string;
    profileImage?: string;
    bio?: string;
    experience?: string;
    AboutMe?: string;
  };
}

/**
 * Group class details — Register for students; host Start/Join/End for owner.
 */
function ClassDetailsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const classId = searchParams.get("classId");
  const user = JSON.parse(Cookies.get("user") || "{}");
  const studentId = user?._id || user?.id;

  const [classData, setClassData] = useState<ClassType | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [joiningMeeting, setJoiningMeeting] = useState(false);

  const isOwn = canJoinAsHost(user, classData?.teacher);

  /**
   * Reloads class document after start/end meeting.
   */
  const refreshClass = async () => {
    if (!classId) return;
    const token = Cookies.get("accessToken");
    const res = await fetch(`${BASE_URL}/classes/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setClassData(data.data || data);
  };

  useEffect(() => {
    if (!classId) return;
    const fetchClass = async () => {
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(`${BASE_URL}/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClassData(data.data || data);
      } catch (err) {
        console.error("Failed to fetch class", err);
      }
    };
    fetchClass();
  }, [classId]);

  useEffect(() => {
    if (!classId || !studentId || isOwn) return;
    const checkEnrollment = async () => {
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(
          `${BASE_URL}/classes/class/${classId}/student/${studentId}/enrolled`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setIsEnrolled(data?.enrolled === true);
      } catch (err) {
        console.error("Failed to check enrollment", err);
      }
    };
    checkEnrollment();
  }, [classId, studentId, isOwn]);

  /**
   * Enrolls the current student in this class.
   */
  const handleRegister = async () => {
    if (!classId || !studentId) return;
    setJoining(true);
    try {
      const token = Cookies.get("accessToken");
      const res = await fetch(
        `${BASE_URL}/classes/${classId}/add-student/${studentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setIsEnrolled(true);
        setTimeout(() => {
          router.push("/Homepage/Group");
        }, 800);
      }
    } catch (err) {
      console.error("Failed to register for class", err);
    } finally {
      setJoining(false);
    }
  };

  /**
   * Starts the Zoom meeting for this class (host only).
   */
  const handleStartClass = async () => {
    if (!classData?._id) return;
    setLoadingAction("start");
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }
      await axios.post(
        `${BASE_URL}/classes/start-meeting/${classData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      await refreshClass();
    } catch (error) {
      console.error("Error starting class:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to start class meeting. Please try again.";
      alert(errorMessage);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Ends the live meeting (host only).
   */
  const handleEndMeeting = async () => {
    if (!classData?._id) return;
    if (!confirm("Are you sure you want to end this meeting?")) return;
    setLoadingAction("end");
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }
      await axios.post(
        `${BASE_URL}/classes/end_meeting/${classData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      await refreshClass();
    } catch (error) {
      console.error("Error ending meeting:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to end meeting. Please try again.";
      alert(errorMessage);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Opens ZoomWebView as host (role:1).
   */
  const handleJoinAsHost = () => {
    if (!canJoinAsHost(user, classData?.teacher)) {
      alert("Only the class teacher can join as host");
      return;
    }
    if (!classData?.meeting_number) {
      alert("Class Not Started - No meeting number available");
      return;
    }
    setJoiningMeeting(true);
    try {
      const payload = {
        number: classData.meeting_number,
        pass: classData.password || "",
        userName: user?.name || "Host",
        email: user?.email || "",
        role: 1,
        account: classData.zoomAccountUsed,
        classId: classData._id || "",
      };
      router.push(
        `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(JSON.stringify(payload))}`,
      );
    } catch (err) {
      console.error("Error joining as host", err);
      alert("Error opening class. Please try again.");
    } finally {
      setJoiningMeeting(false);
    }
  };

  if (!classId) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500">
        Class ID missing
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="px-6 py-16 flex justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#ed662e] border-t-transparent animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  const maxPeople =
    classData.maxCapacity ||
    classData.maxSeats ||
    classData.availableseats ||
    0;
  const enrolledCount = Array.isArray(classData.students)
    ? classData.students.length
    : 0;
  const scheduleLabel = formatDisplayDate(classData.schedule || classData.startDate, {
    withTime: true,
    fallback: "Schedule TBA",
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-5">
      <button
        type="button"
        onClick={() => router.push("/Homepage/Group")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ed662e] hover:text-[#c95520] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 rounded"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to Group Classes
      </button>

      <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-[#fff4ef] shadow-sm">
        <Image
          src={classData.image || "/images/class1.svg"}
          alt={classData.title || "Class"}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 800px"
        />
        {isOwn ? (
          <span className="absolute top-3 left-3 bg-white/95 text-[#ed662e] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-[#ffe0d0]">
            Your class
          </span>
        ) : null}
        {classData.meeting_number ? (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Live ready
          </span>
        ) : null}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {classData.title || "Class"}
        </h1>
        <div className="flex flex-wrap gap-2">
          <MetaChip
            icon={<Clock size={14} aria-hidden />}
            label={`${classData.duration || 60} min`}
          />
          <MetaChip
            icon={<CalendarDays size={14} aria-hidden />}
            label={scheduleLabel}
          />
          <MetaChip
            icon={<Users size={14} aria-hidden />}
            label={
              maxPeople > 0
                ? `${enrolledCount}/${maxPeople} enrolled`
                : `${enrolledCount} enrolled`
            }
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PortalCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
            About
          </p>
          <h3 className="text-base font-semibold mb-2 text-gray-900">
            Class details
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {classData.description?.trim() || "No description available yet."}
          </p>
        </PortalCard>

        <PortalCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Instructor
          </p>
          <div className="flex items-center gap-3 mb-3">
            <LetterAvatar
              name={classData.teacher?.name || "Instructor"}
              src={classData.teacher?.profileImage}
              size={52}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {classData.teacher?.name || "Instructor"}
              </p>
              <p className="text-xs text-gray-500">
                {classData.teacher?.experience || "Wellness instructor"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {classData.teacher?.AboutMe ||
              classData.teacher?.bio ||
              "Experienced wellness instructor guiding this class."}
          </p>
        </PortalCard>
      </div>

      {isOwn ? (
        <HostActionPanel
          hasMeeting={!!classData.meeting_number}
          showStart
          ended={isClassScheduleEnded(classData)}
          starting={loadingAction === "start"}
          joining={joiningMeeting}
          ending={loadingAction === "end"}
          onStart={handleStartClass}
          onJoinAsHost={handleJoinAsHost}
          onEnd={handleEndMeeting}
          hint="Start the meeting when you’re ready, then join as host. Students join from My Classes."
        />
      ) : !isEnrolled ? (
        <button
          type="button"
          onClick={handleRegister}
          disabled={joining}
          className="w-full min-h-[48px] bg-[#ed662e] text-white py-3 rounded-xl font-semibold hover:bg-[#c95520] transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
        >
          {joining ? "Registering…" : "Register for this class"}
        </button>
      ) : (
        <div className="rounded-2xl border border-[#ffe0d0] bg-[#fff4ef]/50 p-5">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            You&apos;re registered
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Join from <strong>My Classes</strong> once the teacher starts the
            live meeting.
          </p>
          <button
            type="button"
            onClick={() => router.push("/Homepage/Classes")}
            className="w-full min-h-[44px] bg-[#ed662e] text-white py-3 rounded-xl font-semibold hover:bg-[#c95520] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
          >
            Go to My Classes
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact meta chip for class header.
 */
function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#ffe0d0] text-gray-700 text-xs font-medium px-3 py-1.5 shadow-sm">
      <span className="text-[#ed662e]">{icon}</span>
      {label}
    </span>
  );
}

export default function ClassDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 flex justify-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-[#ed662e] border-t-transparent animate-spin"
            aria-label="Loading"
          />
        </div>
      }
    >
      <ClassDetailsPageContent />
    </Suspense>
  );
}
