"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import { getUserId } from "@/lib/userId";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClassCard, EventCard, StatsSection, TabNavigation } from "./components";
import EmptyState from "@/components/EmptyState";


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
  zoomAccountUsed?: string;
  zoomJoinUrl?: string;
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
  zoomAccountUsed?: string;
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


  const attendedCount =
    userProfile?.attendance?.filter((a) => a.status === "attended").length || 0;

  const totalHours =
    userProfile?.attendance?.reduce((acc, curr) => {
      const cls = allClasses.find(
        (c) => String(c._id) === String(curr.classId),
      );
      return acc + (cls?.duration || 0);
    }, 0) || 0;

  const hasAttendanceData =
    (userProfile?.attendance?.length || 0) > 0 ||
    attendedCount > 0 ||
    totalHours > 0;


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
        const profile = (profileData?.data || profileData) as UserProfile;
        setUserProfile(profile);

        const userId = getUserId(profile);
        if (!userId) {
          throw new Error("User id missing from profile");
        }

        // Fetch upcoming classes
        const allClassesResponse = await fetch(
          `${BASE_URL}/classes/student/${userId}/classes/upcoming`,
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
          const eventsData = await getUserAppliedEvents(userId) as { events?: EventData[] };
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
    if (!userProfile?.role) {
      alert("Loading your profile — please try Join again in a moment.");
      return;
    }

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

      // My Classes is student-only — always Meeting SDK attendee (role 0, no ZAK)
      const ZoomMeetingNumber = {
        number: classData.meeting_number,
        pass: classData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
        classId: classData._id || "",
        role: 0,
        appRole: "user",
        account: classData.zoomAccountUsed,
      };

      console.log("Data ===>", { ...ZoomMeetingNumber, pass: "***" });

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

      const ZoomMeetingNumber = {
        number: eventData.meeting_number,
        pass: eventData.password || "",
        userName: userProfile?.name || "User",
        email: userProfile?.email || "",
        eventId: eventData._id || "",
        role: 0,
        account: eventData.zoomAccountUsed,
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
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-red-600 font-medium mb-2">Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            My Classes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your learning progress
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/Homepage/Group")}
          className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors self-start sm:self-auto"
        >
          Browse group classes
        </button>
      </div>

      {hasAttendanceData ? (
        <StatsSection
          classesCount={allClasses.length}
          eventsCount={userEvents.length}
          attendedCount={attendedCount}
          totalHours={totalHours}
        />
      ) : null}

      <div className={hasAttendanceData ? "mt-6" : ""}>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          classesCount={allClasses?.length || 0}
          eventsCount={userEvents?.length || 0}
        />

        {activeTab === "classes" && (
          <>
            {(allClasses?.length || 0) === 0 ? (
              <EmptyState
                message="No classes booked yet"
                actionLabel="Browse group classes"
                onAction={() => router.push("/Homepage/Group")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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

        {activeTab === "events" && (
          <>
            {(userEvents?.length || 0) === 0 ? (
              <EmptyState
                message="No events booked yet"
                actionLabel="Browse events"
                onAction={() => router.push("/Homepage/Events")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
