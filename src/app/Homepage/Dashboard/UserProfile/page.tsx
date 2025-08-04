"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Edit,
  Camera,
  Heart,
  Target,
  Award,
  BookOpen,
  Users,
  Star,
  Activity,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

interface UserImage {
  _id: string;
  filename: string;
  path: string;
  key: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  AboutMe?: string;
  notificationToken?: string;
  favoriteClasses?: string[];
  favoriteEvents?: string[];
  favoriteTeachers?: string[];
  userCategory?: string;
  attendance?: string[];
  classFeedback?: string[];
  images?: UserImage[];
  age?: string;
  bodyshape?: string;
  gender?: string;
  height?: string;
  weight?: string;
  expertise?: string[];
  qualification?: Array<{
    title: string;
    subtitle: string;
    year: string;
  }>;
  additional_courses?: string[];
  focusarea?: string[];
  goal?: string[];
  health_issues?: string[];
  achievements?: string[];
  assessments?: Array<{
    id: string;
    name: string;
    score?: number;
    date?: string;
  }>;
  status?: boolean;
  active?: boolean;
}

export default function UserProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) {
          setError("Please login to view your profile");
          setLoading(false);
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
        setUserProfile(data);
        toast.success("Profile loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  const getLatestProfileImage = () => {
    return userProfile.profileImage || "/images/user1.svg";
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Profile Image */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100">
                      <Image
                        src={getLatestProfileImage()}
                        alt={userProfile.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg">
                      <Camera size={16} />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-4">
                    {userProfile.name}
                  </h2>
                  <p className="text-gray-600">{userProfile.email}</p>
                  <div className="mt-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                      {userProfile.userCategory || "Personal"}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Role</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {userProfile.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  {userProfile.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Age</p>
                        <p className="text-sm text-gray-600">
                          {userProfile.age} years
                        </p>
                      </div>
                    </div>
                  )}

                  {userProfile.gender && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Gender
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {userProfile.gender}
                        </p>
                      </div>
                    </div>
                  )}

                  {userProfile.bodyshape && (
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Body Type
                        </p>
                        <p className="text-sm text-gray-600">
                          {userProfile.bodyshape}
                        </p>
                      </div>
                    </div>
                  )}

                  {(userProfile.height || userProfile.weight) && (
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Physical Stats
                        </p>
                        <p className="text-sm text-gray-600">
                          {userProfile.height && `${userProfile.height}cm`}
                          {userProfile.height && userProfile.weight && " • "}
                          {userProfile.weight && `${userProfile.weight}kg`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mt-6 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          userProfile.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span
                        className={`text-sm ${
                          userProfile.active
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {userProfile.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs and Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm">
                {/* Tab Navigation */}
                <div className="">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: "overview", label: "Overview", icon: User },
                      { id: "focus", label: "Focus Areas", icon: Target },
                      {
                        id: "achievements",
                        label: "Achievements",
                        icon: Award,
                      },
                      { id: "favorites", label: "Favorites", icon: Heart },
                      { id: "activity", label: "Activity", icon: Activity },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          About Me
                        </h3>
                        <p className="text-gray-600">
                          {userProfile.AboutMe || "No description available."}
                        </p>
                      </div>

                      {userProfile.focusarea &&
                        userProfile.focusarea.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {userProfile.focusarea.map((area, index) => (
                                <span
                                  key={index}
                                  className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {userProfile.goal && userProfile.goal.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Goals
                          </h3>
                          <div className="space-y-2">
                            {userProfile.goal.map((goal, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Target className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-600">{goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.health_issues &&
                        userProfile.health_issues.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Health Considerations
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {userProfile.health_issues.map((issue, index) => (
                                <span
                                  key={index}
                                  className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {activeTab === "focus" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Focus Areas
                      </h3>
                      {userProfile.focusarea &&
                      userProfile.focusarea.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userProfile.focusarea.map((area, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-orange-500" />
                                <span className="font-medium text-gray-900">
                                  {area}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No focus areas defined yet.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "achievements" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Achievements
                      </h3>
                      {userProfile.achievements &&
                      userProfile.achievements.length > 0 ? (
                        <div className="space-y-4">
                          {userProfile.achievements.map(
                            (achievement, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg"
                              >
                                <Award className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-900">
                                  {achievement}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No achievements yet. Keep practicing!
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "favorites" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Classes
                        </h3>
                        {userProfile.favoriteClasses &&
                        userProfile.favoriteClasses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteClasses.map(
                              (classItem, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    <span className="font-medium text-gray-900">
                                      {classItem}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite classes yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Events
                        </h3>
                        {userProfile.favoriteEvents &&
                        userProfile.favoriteEvents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteEvents.map((event, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-green-500" />
                                  <span className="font-medium text-gray-900">
                                    {event}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite events yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Teachers
                        </h3>
                        {userProfile.favoriteTeachers &&
                        userProfile.favoriteTeachers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteTeachers.map(
                              (teacher, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    <span className="font-medium text-gray-900">
                                      {teacher}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite teachers yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Attendance
                        </h3>
                        {userProfile.attendance &&
                        userProfile.attendance.length > 0 ? (
                          <div className="space-y-2">
                            {userProfile.attendance.map((session, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-900">{session}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No attendance records yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Class Feedback
                        </h3>
                        {userProfile.classFeedback &&
                        userProfile.classFeedback.length > 0 ? (
                          <div className="space-y-2">
                            {userProfile.classFeedback.map(
                              (feedback, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                                >
                                  <Star className="w-5 h-5 text-blue-500" />
                                  <span className="text-gray-900">
                                    {feedback}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No feedback submitted yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
