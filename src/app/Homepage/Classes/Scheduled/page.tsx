"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import TeacherClassCard from "../components/TeacherClassCard";

interface ClassData {
  _id: string;
  title: string;
  description: string;
  classType: string;
  duration: number;
  maxCapacity: number;
  image: string;
  status: boolean;
  classCategory: string;
  level: string[];
  perfectFor: string[];
  skipIf: string[];
  whatYoullGain: string[];
  meeting_number?: string;
  password?: string;
  zoomAccountUsed?: string;
  teacher: string | {
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
  schedules: Array<{
    _id: string;
    days: string[];
    startTime: string;
    endTime: string;
  }>;
  schedule: string;
  students: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ScheduledClassesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getCookie("accessToken");

        if (!accessToken) {
          setError("No access token found");
          setLoading(false);
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // Check if user is a teacher
        if (profileData.role !== "teacher") {
          setError("Access denied. This page is only for teachers.");
          setLoading(false);
          return;
        }

        // Fetch teacher's classes
        await fetchTeacherClasses(profileData.id, accessToken as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTeacherClasses = async (teacherId: string, accessToken: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/classes/teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      interface ApiResponse {
        data?: ClassData[];
      }
      const responseData = response.data as ApiResponse | ClassData[];
      const classesData = Array.isArray(responseData) 
        ? responseData 
        : responseData?.data || [];
      // Filter to show only classes created by the logged-in teacher
      const filteredClasses = Array.isArray(classesData)
        ? classesData.filter(
            (cls: ClassData) => cls.teacher === teacherId
          )
        : [];
      setTeacherClasses(filteredClasses);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      throw error;
    }
  };

  const handleStartClass = async (classId: string) => {
    setLoadingAction("start");
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        alert("Authentication required");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/classes/start-meeting/${classId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Refresh classes to get updated meeting info
        if (userProfile) {
          await fetchTeacherClasses(userProfile.id, accessToken as string);
        }
        alert("Class meeting started successfully!");
      }
    } catch (error) {
      console.error("Error starting class:", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 
         'data' in error.response && error.response.data &&
         typeof error.response.data === 'object' && 'message' in error.response.data)
          ? String(error.response.data.message)
          : "Failed to start class meeting. Please try again.";
      alert(errorMessage);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleJoinClass = async (classId: string) => {
    setLoadingAction("join");
    try {
      const classData = teacherClasses.find((cls) => cls._id === classId);

      if (!classData) {
        alert("Class data not found");
        setLoadingAction(null);
        return;
      }

      if (!classData.meeting_number) {
        alert("Meeting not started yet");
        setLoadingAction(null);
        return;
      }

      
      const ZoomMeetingNumber = {
        number: classData.meeting_number,
        pass: classData.password,
        userName: userProfile && userProfile.name,
        email: userProfile && userProfile.email,
        classId: classData._id || "",
        role:1,
        account:classData.zoomAccountUsed
      };

      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);
      router.push(
        `/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(
          zoomMeetingNumberString
        )}`
      );
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Error opening class. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndMeeting = async (classId: string) => {
    if (!confirm("Are you sure you want to end this meeting?")) {
      return;
    }

    setLoadingAction("end");
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        alert("Authentication required");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/classes/end_meeting/${classId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Refresh classes to get updated meeting info
        if (userProfile) {
          await fetchTeacherClasses(userProfile.id, accessToken as string);
        }
        alert("Meeting ended successfully!");
      }
    } catch (error) {
      console.error("Error ending meeting:", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 
         'data' in error.response && error.response.data &&
         typeof error.response.data === 'object' && 'message' in error.response.data)
          ? String(error.response.data.message)
          : "Failed to end meeting. Please try again.";
      alert(errorMessage);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewDetails = (classId: string) => {
    router.push(`/Homepage/Classes/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="text-red-600 font-medium mb-2">Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            Scheduled Classes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and start your scheduled classes
          </p>
        </div>

        {/* Classes Grid */}
        {teacherClasses.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              No scheduled classes yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {teacherClasses.map((classItem, index) => (
              <TeacherClassCard
                key={classItem._id || index}
                classItem={classItem}
                onStartClass={handleStartClass}
                onJoinClass={handleJoinClass}
                onEndMeeting={handleEndMeeting}
                onViewDetails={handleViewDetails}
                isLoading={loadingAction !== null}
                loadingAction={loadingAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

