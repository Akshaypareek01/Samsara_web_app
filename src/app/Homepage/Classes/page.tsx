"use client";

import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  profileImage?: string;
}

interface Attendance {
  id: string;
  classId: string;
  date: string;
  status: string;
}

interface ClassFeedback {
  id: string;
  classId: string;
  rating: number;
  comment: string;
  date: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  type: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  teacherCategory?: string;
  profileImage?: string;
  AboutMe?: string;
  attendance: Attendance[];
  classFeedback: ClassFeedback[];
  favoriteClasses: FavoriteItem[];
  favoriteEvents: FavoriteItem[];
  favoriteTeachers: FavoriteItem[];
}

interface ClassData {
  id: string;
  title: string;
  instructor: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  participants: Participant[];
  instructorImage?: string;
}

export default function MyClassesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch upcoming classes
        const upcomingResponse = await fetch(
          `${BASE_URL}/classes/student/${profileData.id}/classes/upcoming`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          setUpcomingClasses(upcomingData);
        }

        // Fetch all classes
        const allClassesResponse = await fetch(
          `${BASE_URL}/classes/student/${profileData.id}/classes`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (allClassesResponse.ok) {
          const allClassesData = await allClassesResponse.json();
          setAllClasses(allClassesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BASE_URL]);

  const stats = [
    {
      icon: <Calendar className="w-6 h-6 text-[#F38A6A]" />,
      value: (allClasses?.length || 0).toString(),
      label: "Classes Booked",
    },
    {
      icon: <User className="w-6 h-6 text-[#F38A6A]" />,
      value: (userProfile?.attendance?.length || 0).toString(),
      label: "Classes Attended",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#F38A6A]" />,
      value: "36", // This could be calculated from class durations
      label: "Total Hours",
    },
  ];

  const classItems = [
    {
      image: "/images/room4.svg",
      title: "Upcoming Classes",
      subtitle: `${upcomingClasses?.length || 0} Classes`,
    },
    {
      image: "/images/room3.svg",
      title: "Past Classes",
      subtitle: `${
        (allClasses?.length || 0) - (upcomingClasses?.length || 0)
      } Classes`,
    },
    {
      image: "/images/room2.svg",
      title: "Favorites",
      subtitle: `${userProfile?.favoriteClasses?.length || 0} Items`,
    },
    {
      image: "/images/room1.svg",
      title: "Class Wraps",
      subtitle: `${userProfile?.classFeedback?.length || 0} Materials`,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-12 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-white">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">My Classes</h1>
      <p className="text-gray-500 mb-6">Track your learning progress</p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-sm rounded-xl p-4 flex items-center space-x-4 border border-gray-100"
          >
            <div className="bg-[#F38A6A]/10 rounded-full p-2">{item.icon}</div>
            <div>
              <h2 className="text-xl font-semibold">{item.value}</h2>
              <p className="text-gray-500 text-sm">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={500}
              height={300}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 text-center">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Today&apos;s Classes</h2>
        {(upcomingClasses?.length || 0) === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming classes for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {(upcomingClasses || []).slice(0, 4).map((classItem, index) => (
              <div
                key={classItem.id || index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FEEFE9]">
                        <div className="w-4 h-4 border-2 border-[#F38A6A] rounded-full" />
                      </div>
                      <h3 className="font-semibold text-[16px] text-gray-900">
                        {classItem.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 ml-12">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{classItem.startTime}</span>
                      <User className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{classItem.instructor}</span>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full">
                    {classItem.status}
                  </span>
                </div>

                {/* Time and Location */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>
                      {classItem.startTime} - {classItem.endTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span>{classItem.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 12l4.243-4.243m0 8.486L9.172 4.929a4 4 0 015.656-5.656l8.485 8.485a4 4 0 01-5.656 5.656z"
                      />
                    </svg>
                    <span>{classItem.location}</span>
                  </div>
                </div>

                {/* Avatars + Link */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex -space-x-2">
                    {classItem.participants
                      ?.slice(0, 3)
                      .map((participant: Participant, idx: number) => (
                        <Image
                          key={idx}
                          src={
                            participant.profileImage ||
                            "https://randomuser.me/api/portraits/women/1.jpg"
                          }
                          alt={`avatar${idx}`}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-white"
                        />
                      ))}
                    {classItem.participants?.length > 3 && (
                      <span className="text-xs text-gray-500 pl-2">
                        +{classItem.participants.length - 3} more
                      </span>
                    )}
                  </div>
                  <button className="text-sm text-orange-500 font-medium hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
