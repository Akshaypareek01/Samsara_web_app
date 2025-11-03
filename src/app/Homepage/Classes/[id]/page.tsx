"use client";

import Image from "next/image";
import { Calendar, User, Clock, ArrowLeft, Users, Star, X, Play, Square, Trash2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";

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

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setClassId(resolvedParams.id);
    });
  }, [params]);

  if (!classId) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return <ClassDetailsContent classId={classId} />;
}

function ClassDetailsContent({ classId }: { classId: string }) {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningClass, setJoiningClass] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) {
          setError("Please login to view class details");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }

        const data = await response.json();
        setClassData(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

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
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);


  // Check if current user is the teacher who created this class
  const isClassCreator = () => {
    if (!userProfile || !classData) {
      console.log("Missing data:", { userProfile: !!userProfile, classData: !!classData });
      return false;
    }
    if (userProfile.role !== "teacher") {
      console.log("User role is not teacher:", userProfile.role);
      return false;
    }
    
    const teacherId = typeof classData.teacher === "string" 
      ? classData.teacher 
      : classData.teacher._id;
    console.log("teacherId ===>", teacherId);
    console.log("userProfile.id ===>", userProfile.id);
    const isCreator = userProfile.id === teacherId;
    console.log("isClassCreator result:", isCreator);
    return isCreator;
  };

  const handleStartClass = async () => {
    if (!classData) return;
    setLoadingAction("start");
    
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        alert("Authentication required");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/classes/start-meeting/${classData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Refresh class data
        const refreshResponse = await fetch(`${BASE_URL}/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setClassData(data.data || data);
        }
        alert("Class meeting started successfully!");
      }
    } catch (error: any) {
      console.error("Error starting class:", error);
      alert(
        error.response?.data?.message ||
          "Failed to start class meeting. Please try again."
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndMeeting = async () => {
    if (!classData) return;
    if (!confirm("Are you sure you want to end this meeting?")) return;
    
    setLoadingAction("end");
    
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        alert("Authentication required");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/classes/end_meeting/${classData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Refresh class data
        const refreshResponse = await fetch(`${BASE_URL}/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setClassData(data.data || data);
        }
        alert("Meeting ended successfully!");
      }
    } catch (error: any) {
      console.error("Error ending meeting:", error);
      alert(
        error.response?.data?.message ||
          "Failed to end meeting. Please try again."
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteClass = async () => {
    if (!classData) return;
    if (
      !confirm(
        "Are you sure you want to delete this class? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoadingAction("delete");
    
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        alert("Authentication required");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/classes/${classData._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 204) {
        alert("Class deleted successfully!");
        router.push("/Homepage/Classes/Scheduled");
      }
    } catch (error: any) {
      console.error("Error deleting class:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete class. Please try again."
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleJoinClass = async () => {
    if (!classData) return;
    
    setJoiningClass(true);
    
    try {
      // Check if meeting number exists
      if (!classData.meeting_number) {
        alert("Class Not Started - No meeting number available");
        setJoiningClass(false);
        return;
      }

      // Create Zoom meeting URL
      const ZoomMeetingNumber = {
        number: classData.meeting_number,
        pass: classData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
        role: userProfile?.role === "teacher" ? 1 : 0,
        account: classData.zoomAccountUsed,
      };

      console.log("Data ===>", ZoomMeetingNumber);
      
      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);
      
      // Navigate to webview page with meeting data
      router.push(`/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(zoomMeetingNumberString)}`);
      
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Error opening class. Please try again.");
    } finally {
      setJoiningClass(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading class details...</div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error: {error || "Class not found"}</div>
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
        <h1 className="text-2xl md:text-3xl font-semibold">Class Details</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Class Image */}
        <div className="relative mb-8">
          <Image
            src={classData.image}
            alt={classData.title}
            width={800}
            height={400}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <span className="text-sm px-3 py-1 bg-white/90 text-gray-700 rounded-full">
              {classData.classType}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              classData.status 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {classData.status ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Class Title & Description */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{classData.title}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{classData.description}</p>
            </div>

            {/* Teacher Section */}
            {typeof classData.teacher === "object" && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                <div className="flex items-start space-x-4">
                  <Image
                    src={classData.teacher.profileImage}
                    alt={classData.teacher.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{classData.teacher.name}</h4>
                    <p className="text-gray-600 mb-3">{classData.teacher.teacherCategory}</p>
                    {classData.teacher.AboutMe && (
                      <p className="text-gray-600 mb-3">{classData.teacher.AboutMe}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {classData.teacher.expertise.map((skill, idx) => (
                        <span key={idx} className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What You'll Gain */}
            {classData.whatYoullGain.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What You&apos;ll Gain</h3>
                <ul className="space-y-3">
                  {classData.whatYoullGain.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skip If */}
            {classData.skipIf.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Skip If</h3>
                <ul className="space-y-3">
                  {classData.skipIf.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Class Info & Actions */}
          <div className="space-y-6">
            {/* Class Details Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Class Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-gray-600">{classData.duration} minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-gray-600">Max {classData.maxCapacity} students</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Schedule</p>
                    <p className="text-gray-600">
                      {classData.schedules[0]?.days.join(', ')}
                    </p>
                    <p className="text-gray-600">
                      {classData.schedules[0]?.startTime} - {classData.schedules[0]?.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Enrolled</p>
                    <p className="text-gray-600">{classData.students.length} students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level & Perfect For */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Class Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Level</p>
                  <div className="flex flex-wrap gap-2">
                    {classData.level.map((level, idx) => (
                      <span key={idx} className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Perfect For</p>
                  <div className="flex flex-wrap gap-2">
                    {classData.perfectFor.map((item, idx) => (
                      <span key={idx} className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky top-4 space-y-4">
              {/* Teacher Actions - Only show if user is the class creator */}
              {(() => {
                const isCreator = isClassCreator();
                console.log("Rendering check - isCreator:", isCreator);
                console.log("Rendering check - meeting_number:", classData.meeting_number);
                console.log("Rendering check - status:", classData.status);
                return isCreator;
              })() && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Manage Class</h3>
                  <div className="space-y-3">
                    {/* Show Start Class button when no meeting number exists */}
                    {!classData.meeting_number && (
                      <button
                        onClick={handleStartClass}
                        disabled={loadingAction === "start"}
                        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        {loadingAction === "start" ? "Starting..." : "Start Class"}
                      </button>
                    )}

                    {/* Show Join and End Meeting buttons when meeting number exists */}
                    {classData.meeting_number && (
                      <>
                        <button
                          onClick={handleJoinClass}
                          disabled={joiningClass}
                          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-5 h-5" />
                          {joiningClass ? "Joining..." : "Join Meeting"}
                        </button>
                        <button
                          onClick={handleEndMeeting}
                          disabled={loadingAction === "end"}
                          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Square className="w-5 h-5" />
                          {loadingAction === "end" ? "Ending..." : "End Meeting"}
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleDeleteClass}
                      disabled={loadingAction === "delete"}
                      className="w-full bg-gray-100 text-red-600 py-3 px-4 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {loadingAction === "delete" ? "Deleting..." : "Delete Class"}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Join Button - Show only for students (not teachers who created the class) */}
              {classData.status && !isClassCreator() && (
                <div>
                  <button
                    onClick={handleJoinClass}
                    disabled={joiningClass}
                    className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joiningClass ? "Joining..." : "Join Class"}
                  </button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {classData.students.length} students enrolled
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
