"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClassCard, EventCard, StatsSection, TabNavigation } from "./components";

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

export default function MyClassesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [userEvents, setUserEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningClass, setJoiningClass] = useState<string | null>(null);
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'events'>('classes');
  const router = useRouter();

  // Get user's applied events
  const getUserAppliedEvents = async (userId: string) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await axios.get(`${BASE_URL}/events/user-events/${userId}/upcoming`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user applied events:', error);
      throw error;
    }
  };

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

        // Fetch user events
        try {
          const eventsData = await getUserAppliedEvents(profileData.id) as { events?: EventData[] };
          setUserEvents(eventsData.events || []);
        } catch (eventsError) {
          console.error('Error fetching events:', eventsError);
          // Don't set error for events, just log it
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

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvent(eventId);
    
    try {
      // Find the event data to get meeting details
      const eventData = userEvents.find(event => event._id === eventId);
      
      if (!eventData) {
        alert("Event data not found");
        setJoiningEvent(null);
        return;
      }

      // Check if meeting number exists
      if (!eventData.meeting_number) {
        alert("Event Not Started - No meeting number available");
        setJoiningEvent(null);
        return;
      }

      // Create Zoom meeting URL
      const ZoomMeetingNumber = {
        number: eventData.meeting_number,
        pass: eventData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
      };

      console.log("Event Data ===>", ZoomMeetingNumber);
      
      const zoomMeetingNumberString = JSON.stringify(ZoomMeetingNumber);
      
      // Navigate to webview page with meeting data
      router.push(`/Homepage/ZoomWebView?ZoomMeetingNumber=${encodeURIComponent(zoomMeetingNumberString)}`);
      
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Error opening event. Please try again.");
    } finally {
      setJoiningEvent(null);
    }
  };

  const handleViewDetails = (classId: string) => {
    router.push(`/Homepage/Classes/${classId}`);
  };

  const handleViewEventDetails = (eventId: string) => {
    router.push(`/Homepage/Events/${eventId}`);
  };


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
      <StatsSection 
        classesCount={allClasses?.length || 0} 
        eventsCount={userEvents?.length || 0} 
      />

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
        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          classesCount={allClasses?.length || 0}
          eventsCount={userEvents?.length || 0}
        />

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <>
            {(allClasses?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No classes booked yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {(allClasses || []).map((classItem, index) => (
                  <ClassCard
                    key={classItem._id || index}
                    classItem={classItem}
                    joiningClass={joiningClass}
                    onJoinClass={handleJoinClass}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {(userEvents?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No events booked yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {(userEvents || []).map((eventItem, index) => (
                  <EventCard
                    key={eventItem._id || index}
                    eventItem={eventItem}
                    joiningEvent={joiningEvent}
                    onJoinEvent={handleJoinEvent}
                    onViewDetails={handleViewEventDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
