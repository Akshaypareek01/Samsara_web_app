"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface ClassType {
  _id?: string;
  image?: string;
  title?: string;
  teacher?: { name?: string; profileImage?: string };
  schedule?: string;
  type?: string;
  status?: string;
  availableseats?: number;
  startDate?: string; // Add startDate for filtering
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [myClasses, setMyClasses] = useState<ClassType[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassType[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     setLoading(true);
  //     setError("");
  //     try {
  //       const res = await fetch(`${BASE_URL}/classes`);
  //       const data = await res.json();
  //       let classArray = data;
  //       if (data && typeof data === "object" && !Array.isArray(data)) {
  //         if (Array.isArray(data.data)) classArray = data.data;
  //         else if (Array.isArray(data.classes)) classArray = data.classes;
  //         else classArray = [];
  //       }
  //       setClasses(classArray);
  //       setFilteredClasses(classArray); // Initialize filtered classes
  //     } catch {
  //       setError("Failed to fetch classes");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchClasses();
  // }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("accessToken");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?._id) {
        setUserId(data._id);
      }
    };

    fetchProfile();
  }, []);

  // Fetch upcoming classes for the logged-in student after userId is available from profile
  // useEffect(() => {
  //   if (!userId) return;

  //   const fetchClasses = async () => {
  //     setLoading(true);
  //     setError("");

  //     try {
  //       const token = Cookies.get("accessToken");

  //       const res = await fetch(
  //         `${BASE_URL}/classes/student/${userId}/classes/upcoming`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await res.json();

  //       const classArray = data.classes || [];

  //       setClasses(classArray);
  //       setFilteredClasses(classArray);
  //     } catch {
  //       setError("Failed to fetch classes");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchClasses();
  // }, [userId]);

// Fetch all available classes to display in Group page
useEffect(() => {
  const fetchClasses = async () => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("accessToken");

      const res = await fetch(`${BASE_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const classArray = data.data || [];

      setClasses(classArray);
      setFilteredClasses(classArray);
    } catch {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  fetchClasses();
}, []);

  // Fetch all enrolled classes for My Classes section
  useEffect(() => {
  if (!userId) return;

  const fetchMyClasses = async () => {
    try {
      const token = Cookies.get("accessToken");

      const res = await fetch(`${BASE_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const enrolledClasses =
        (data.data || []).filter((cls: any) =>
          cls.students?.some((s: any) => s._id === userId)
        );

      setMyClasses(enrolledClasses);
    } catch (err) {
      console.log("Failed to fetch my classes", err);
    }
  };

  fetchMyClasses();
}, [userId]);
  // useEffect(() => {
  //   if (!userId) return;

  //   const fetchMyClasses = async () => {
  //     try {
  //       const token = Cookies.get("accessToken");

  //       const res = await fetch(
  //         `${BASE_URL}/classes/student/${userId}/classes`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await res.json();
  //       setMyClasses(data.classes || []);
  //     } catch (err) {
  //       console.log("Failed to fetch my classes", err);
  //     }
  //   };

  //   fetchMyClasses();
  // }, [userId]);

  // Filter classes based on selected filter
  const filterClasses = (filter: string) => {
    setSelectedFilter(filter);

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    if (filter === "All") {
      setFilteredClasses(classes);
    } else if (filter === "Today") {
      setFilteredClasses(
        classes.filter((classItem) => {
          // Use startDate if available, otherwise use schedule
          if (classItem.startDate) {
            const classDate = new Date(classItem.startDate)
              .toISOString()
              .split("T")[0];
            return classDate === today;
          } else if (classItem.schedule) {
            const classDate = new Date(classItem.schedule)
              .toISOString()
              .split("T")[0];
            return classDate === today;
          }
          // If no date info, assume it's today's class
          return true;
        }),
      );
    } else if (filter === "Tomorrow") {
      setFilteredClasses(
        classes.filter((classItem) => {
          if (classItem.startDate) {
            const classDate = new Date(classItem.startDate)
              .toISOString()
              .split("T")[0];
            return classDate === tomorrowDate;
          } else if (classItem.schedule) {
            const classDate = new Date(classItem.schedule)
              .toISOString()
              .split("T")[0];
            return classDate === tomorrowDate;
          }
          // If no date info, assume it's not tomorrow's class
          return false;
        }),
      );
    }
  };

  // Update filtered classes when classes change
  useEffect(() => {
    setFilteredClasses(classes);
  }, [classes]);

  const filters = ["All", "Today", "Tomorrow"];

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          {/* <Image
            src="/images/peoples.svg"
            alt="Upcoming Classes"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          /> */}
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Classes"
            fill
            style={{ objectFit: "cover" }}
            className="brightness-[0.6] rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-start px-8">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-1">Group Classes</h2>
              <p className="text-sm">Practise Together, heal together.</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
            {filteredClasses.length}+ Classes{" "}
            {selectedFilter !== "All" ? selectedFilter : "Today"}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => filterClasses(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Online Classes Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Online Classes</h3>
          <button className="text-orange-500 text-sm font-medium">
            See All
          </button>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              Loading classes...
            </div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-500 py-8">
              {error}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No classes available for {selectedFilter.toLowerCase()}.
            </div>
          ) : (
            filteredClasses.map((item, i) => (
              <div
                key={item._id || i}
                className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white"
              >
                {/* Card Image */}
                <div className="relative h-[150px] w-full">
                  {/* <Image
                    src={item.image || "/images/class1.svg"}
                    alt={item.title || "Class Thumbnail"}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                  /> */}
                  <Image
                    src={item.image || "/images/class1.svg"}
                    alt={item.title || "Class Thumbnail"}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-xl"
                  />
                  {item.status === "live" && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Live
                    </div>
                  )}
                </div>
                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-semibold">
                    {item.title || "Untitled Class"}
                  </h4>
                  {/* Instructor */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Image
                      src={item.teacher?.profileImage || "/images/logo.svg"}
                      width={24}
                      height={24}
                      alt={item.teacher?.name || "Instructor"}
                      className="rounded-full object-cover"
                    />
                    <span>with {item.teacher?.name || "Unknown"}</span>
                  </div>
                  {/* Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {item.schedule
                        ? new Date(item.schedule).toLocaleString()
                        : "No schedule"}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {item.type === "free" ? "Free" : "Paid"}
                    </div>
                  </div>
                  {/* Bottom Row */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center text-gray-400 gap-1">
                      <Users size={14} />
                      {item.availableseats || 0} spots left
                    </div>
                    {/* <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md hover:bg-orange-600 cursor-pointer">
                      Join
                    </button> */}
                    <button
                      onClick={() =>
                        router.push(
                          `/Homepage/Group/Details?classId=${item._id}`,
                        )
                      }
                      className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md hover:bg-orange-600"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* My Classes Section */}

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold">My Classes</h3>
            <button className="text-sm text-orange-500 font-medium">
              See All
            </button>
          </div>

          {/* Class List */}
          {myClasses.length === 0 ? (
            <p className="text-sm text-gray-500">No enrolled classes yet.</p>
          ) : (
            myClasses.map((classItem: ClassType, index: number) => (
              <div
                key={classItem._id || index}
                className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="flex gap-3 items-center">
                  <Image
                    src={classItem.image || "/images/class1.svg"}
                    alt={classItem.title || "Class Thumbnail"}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-medium">
                      {classItem.title || "Class"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {classItem.startDate
                        ? new Date(classItem.startDate).toLocaleString()
                        : "No date"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/Homepage/Group/Details?classId=${classItem._id}`,
                    )
                  }
                  className="text-sm border px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  View Details →
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
