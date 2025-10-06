"use client";

import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  schedules: Array<{
    _id: string;
    days: string[];
    startTime: string;
    endTime: string;
  }>;
  schedule: string;
  students: string[];
}

export default function MyClassesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningClass, setJoiningClass] = useState<string | null>(null);
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

        // Fetch upcoming classes
        // const upcomingResponse = await fetch(
        //   `${BASE_URL}/classes/student/${profileData.id}/classes/upcoming`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // if (upcomingResponse.ok) {
        //   const upcomingData = await upcomingResponse.json();
        //   setUpcomingClasses(upcomingData);
        // }

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
          setAllClasses(allClassesData.data || allClassesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoinClass = async (classId: string) => {
    setJoiningClass(classId);
    
    try {
      // Find the class data to get meeting details
      const classData = allClasses.find(cls => cls._id === classId);
      
      if (!classData) {
        alert("Class data not found");
        setJoiningClass(null);
        return;
      }

      // Check if meeting number exists
      if (!classData.meeting_number) {
        alert("Class Not Started - No meeting number available");
        setJoiningClass(null);
        return;
      }

      // Create Zoom meeting URL
      const ZoomMeetingNumber = {
        number: classData.meeting_number,
        pass: classData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
      };

      console.log("Data ===>", ZoomMeetingNumber);
      
      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);
      
      // Navigate to webview page with meeting data
      router.push(`/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(zoomMeetingNumberString)}`);
      
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Error opening class. Please try again.");
    } finally {
      setJoiningClass(null);
    }
  };

  const handleViewDetails = (classId: string) => {
    router.push(`/Homepage/Classes/${classId}`);
  };

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

  // const classItems = [
  //   {
  //     image: "/images/room4.svg",
  //     title: "Upcoming Classes",
  //     subtitle: `${upcomingClasses?.length || 0} Classes`,
  //   },
  //   {
  //     image: "/images/room3.svg",
  //     title: "Past Classes",
  //     subtitle: `${
  //       (allClasses?.length || 0) - (upcomingClasses?.length || 0)
  //     } Classes`,
  //   },
  //   {
  //     image: "/images/room2.svg",
  //     title: "Favorites",
  //     subtitle: `${userProfile?.favoriteClasses?.length || 0} Items`,
  //   },
  //   {
  //     image: "/images/room1.svg",
  //     title: "Class Wraps",
  //     subtitle: `${userProfile?.classFeedback?.length || 0} Materials`,
  //   },
  // ];

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
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div> */}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">My Classes</h2>
        {(allClasses?.length || 0) === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No classes booked yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {(allClasses || []).map((classItem, index) => (
              <div
                key={classItem._id || index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4"
              >
                {/* Class Image */}
                <div className="relative">
                  <Image
                    src={classItem.image}
                    alt={classItem.title}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/90 text-gray-700 rounded-full">
                    {classItem.classType}
                  </span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[16px] text-gray-900">
                      {classItem.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{classItem.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{classItem.teacher.name}</span>
                      <span className="text-gray-300">•</span>
                      <span>{classItem.teacher.teacherCategory}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    classItem.status 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {classItem.status ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Class Details */}
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>{classItem.duration} minutes</span>
                    <span className="text-gray-300">•</span>
                    <span>Max {classItem.maxCapacity} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{classItem.schedules[0]?.days.join(', ')}</span>
                    <span className="text-gray-300">•</span>
                    <span>{classItem.schedules[0]?.startTime} - {classItem.schedules[0]?.endTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {classItem.level.map((level, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {classItem.students.length} enrolled
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(classItem._id)}
                      className="text-sm text-orange-500 font-medium hover:underline"
                    >
                      View Details
                    </button>
                    {classItem.status && (
                      <button 
                        onClick={() => handleJoinClass(classItem._id)}
                        disabled={joiningClass === classItem._id}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningClass === classItem._id ? "Joining..." : "Join Class"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
