"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/utils";

interface ClassType {
  _id?: string;
  image?: string;
  title?: string;
  teacher?: { name?: string; profileImage?: string };
  schedule?: string;
  type?: string;
  status?: string;
  availableseats?: number;
}

export default function ClassesPage() {
  // const router = useRouter(); // removed unused router
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/classes`);
        const data = await res.json();
        let classArray = data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (Array.isArray(data.data)) classArray = data.data;
          else if (Array.isArray(data.classes)) classArray = data.classes;
          else classArray = [];
        }
        setClasses(classArray);
      } catch {
        setError("Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);
  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Classes"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-start px-8">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-1">Group Classes</h2>
              <p className="text-sm">Practise Together, heal together.</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
            15+ Classes Today
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <button className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
            All
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Today
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Tomorrow
          </button>
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
          ) : classes.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No classes scheduled.
            </div>
          ) : (
            classes.map((item, i) => (
              <div
                key={item._id || i}
                className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white"
              >
                {/* Card Image */}
                <div className="relative h-[150px] w-full">
                  <Image
                    src={item.image || "/images/class1.svg"}
                    alt={item.title || "Class Thumbnail"}
                    layout="fill"
                    objectFit="cover"
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
                    <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md hover:bg-orange-600 cursor-pointer">
                      Join
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
          {[
            {
              title: "Morning Flow",
              time: "Tomorrow, 7:00 AM",
              location: "Online",
              enrolled: 25,
              img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=facearea&facepad=3&w=64&h=64&q=80",
            },
            {
              title: "Evening Meditation",
              time: "Friday, 6:00 PM",
              location: "Bandra Center",
              enrolled: 18,
              img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=facearea&facepad=3&w=64&h=64&q=80",
            },
          ].map((classItem, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3"
            >
              {/* Left Side */}
              <div className="flex gap-3 items-center">
                <Image
                  src={classItem.img}
                  alt={classItem.title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-sm font-medium">{classItem.title}</h4>
                  <p className="text-xs text-gray-500">{classItem.time}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span>📍 {classItem.location}</span>
                    <span>👥 {classItem.enrolled} Enrolled</span>
                  </div>
                </div>
              </div>

              {/* Right Side Button */}
              <button className="text-sm border px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
