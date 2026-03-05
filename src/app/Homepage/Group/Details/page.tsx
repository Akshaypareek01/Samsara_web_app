"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import { useEffect, useState } from "react";
interface ClassType {
  _id?: string;
  image?: string;
  title?: string;
  description?: string;
  meeting_number?: string;
  password?: string;

  duration?: number;
  startDate?: string;
  availableseats?: number;
  maxSeats?: number;

  teacher?: {
    _id?: string;
    name?: string;
    profileImage?: string;
    bio?: string;
    experience?: string;
  };
}

export default function ClassDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const classId = searchParams.get("classId");
const user = JSON.parse(Cookies.get("user") || "{}");
const studentId = user?.id;

  const [classData, setClassData] = useState<ClassType | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [joining, setJoining] = useState(false);




  // Fetch class details
  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      const token = Cookies.get("accessToken");

      const res = await fetch(`${BASE_URL}/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      //setClassData(data.data || data);
      setClassData(data.data);
    };

    fetchClass();
  }, [classId]);

  // Check if student is enrolled
useEffect(() => {
  if (!classId || !studentId) return;

  const checkEnrollment = async () => {
    const token = Cookies.get("accessToken");

    const res = await fetch(
      `${BASE_URL}/classes/class/${classId}/student/${studentId}/enrolled`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setIsEnrolled(data?.enrolled === true);
  };

  checkEnrollment();
}, [classId, studentId]);

// Register class
const handleRegister = async () => {
  if (!classId || !studentId) return;

  setJoining(true);

  try {
    const token = Cookies.get("accessToken");

    const res = await fetch(
      `${BASE_URL}/classes/${classId}/add-student/${studentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setIsEnrolled(true);
    }

  } catch (err) {
    console.log(err);
  } finally {
    setJoining(false);
  }
};

  // Join class
  const handleJoin = () => {
    if (!classData?.meeting_number) {
      alert("Class not started yet");
      return;
    }

    const zoomData = {
      number: classData.meeting_number,
      pass: classData.password || "",
      eventId: classData._id,
    };

    router.push(
      `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(
        JSON.stringify(zoomData),
      )}`,
    );
  };

  if (!classData) {
    return <div className="p-6 text-center">Loading class details...</div>;
  }

return (
  <div className="p-6 max-w-5xl mx-auto space-y-6">

    {/* Banner */}
    <Image
      src={classData.image || "/images/class1.svg"}
      alt={classData.title || "Class"}
      width={800}
      height={350}
      className="rounded-xl w-full h-64 object-cover"
    />

    {/* Title */}
    <h2 className="text-2xl font-semibold">{classData.title || "Class"}</h2>

    {/* Meta Info */}
    <div className="flex gap-6 text-sm text-gray-600">
      <span>⏱ {classData.duration || 60} min</span>

      <span>
        📅{" "}
        {classData.startDate
          ? new Date(classData.startDate).toLocaleDateString()
          : "No Date"}
      </span>

      <span>
        👥 Max {classData.maxSeats || classData.availableseats || 0} people
      </span>
    </div>

    {/* Two Cards */}
    <div className="grid md:grid-cols-2 gap-6">

      {/* Class Details Card */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-md font-semibold mb-2">Class Details</h3>

        <p className="text-sm text-gray-600">
          {classData.description || "No description available"}
        </p>
      </div>

      {/* Instructor Card */}
      <div
        onClick={() =>
          router.push(`/Homepage/Instructors/${classData.teacher?._id}`)
        }
        className="bg-white border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-md font-semibold mb-3">Instructor</h3>

        <div className="flex items-center gap-3">
          <Image
            src={
              classData.teacher?.profileImage || "/images/logo.svg"
            }
            width={50}
            height={50}
            alt="Instructor"
            className="rounded-full object-cover"
          />

          <div>
            <p className="text-sm font-medium">
              {classData.teacher?.name || "Instructor"}
            </p>

            <p className="text-xs text-gray-500">
              {classData.teacher?.experience || "Yoga Instructor"}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          {classData.teacher?.bio ||
            "Click to view instructor profile"}
        </p>
      </div>
    </div>

    {/* Register / Join Button */}

    {!isEnrolled ? (
      <button
        onClick={handleRegister}
        disabled={joining}
        className="w-full bg-orange-500 text-white py-3 rounded-md"
      >
        {joining ? "Registering..." : "Register"}
      </button>
    ) : (
      <button
        onClick={handleJoin}
        className="w-full bg-green-500 text-white py-3 rounded-md"
      >
        Join Class
      </button>
    )}
  </div>
);
}
