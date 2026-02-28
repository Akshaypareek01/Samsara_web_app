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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Image
        src={classData.image || "/images/class1.svg"}
        alt={classData.title || "Class"}
        //alt={classData.eventName || "Class"}
        width={600}
        height={300}
        className="rounded-xl w-full h-64 object-cover"
      />

      <h2 className="text-2xl font-semibold">{classData.title || "Class"}</h2>

      <p className="text-gray-600">
        {/* {classData.details || "No description available"} */}
        {classData.description || "No description available"}
      </p>

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
