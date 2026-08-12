"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/utils";

interface TeacherType {
  id?: string;
  name?: string;
  profileImage?: string;
  teacherCategory?: string;
  expertise?: string[];
  focusarea?: string[];
  teachingExperience?: string;
  AboutMe?: string;
  email?: string;
  images?: Array<{
    _id?: string;
    filename?: string;
    path?: string;
    key?: string;
  }>;
  qualification?: Array<{
    title?: string;
    subtitle?: string;
    year?: string;
  }>;
}

export default function OneToOneClassesPage() {
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Get access token from cookies
  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";");
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );
      return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
    }
    return null;
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError("");
      try {
        const accessToken = getAccessToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`${BASE_URL}/users/role/teacher`, {
          method: "GET",
          headers,
        });

        const data = await res.json();
        let teachersArray = [];

        if (
          data &&
          data.status === "success" &&
          data.data &&
          data.data.results
        ) {
          teachersArray = data.data.results;
        }

        setTeachers(teachersArray);
      } catch (err) {
        setError("Failed to fetch teachers");
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const displayedTeachers = showAll ? teachers : teachers.slice(0, 3);

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="One-to-One Classes"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-start px-8">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-1">One-to-One Classes</h2>
              <p className="text-sm">Personal guidance, focused learning.</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
            {teachers.length}+ Expert Teachers
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <button className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
            All
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Available Now
          </button>
          <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Top Rated
          </button>
        </div>

        {/* Online Classes Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Expert Teachers</h3>
          <button
            className="text-orange-500 text-sm font-medium"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "See All"}
          </button>
        </div>

        {/* Teacher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              Loading teachers...
            </div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-500 py-8">
              {error}
            </div>
          ) : displayedTeachers.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              No teachers available.
            </div>
          ) : (
            displayedTeachers.map((teacher, i) => (
              <div
                key={teacher.id || i}
                className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white"
              >
                {/* Card Image */}
                <div className="relative h-[150px] w-full">
                  <Image
                    src={
                      teacher.images && teacher.images.length > 0
                        ? teacher.images[teacher.images.length - 1].path ||
                          "/images/class1.svg"
                        : "/images/class1.svg"
                    }
                    alt={teacher.name || "Teacher"}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Available
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  {/* Name with Profile Image */}
                  <div className="flex items-center gap-2">
                    <Image
                      src={teacher.profileImage || "/images/logo.svg"}
                      alt={teacher.name || "Teacher Profile"}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                    <h4 className="text-sm font-semibold">
                      {teacher.name || "Unknown Teacher"}
                    </h4>
                  </div>

                  {/* Category */}
                  <div className="text-xs text-gray-600">
                    {teacher.teacherCategory || "Fitness Coach"}
                  </div>

                  {/* Expertise/Focus Areas */}
                  <div className="flex flex-wrap gap-1">
                    {(teacher.expertise && teacher.expertise.length > 0
                      ? teacher.expertise
                      : teacher.focusarea
                    )
                      ?.slice(0, 2)
                      .map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Flexible Timing
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      Expert
                    </div>
                  </div>

                  {/* Experience */}
                  {teacher.teachingExperience && (
                    <div className="text-xs text-gray-500">
                      {teacher.teachingExperience} years experience
                    </div>
                  )}

                  {/* Bottom Row */}
                  <div className="flex justify-between items-center text-xs pt-2">
                    <div className="flex items-center text-gray-400 gap-1">
                      <Users size={14} />
                      1-on-1 Session
                    </div>
                    <button
                      type="button"
                      disabled
                      title="1:1 booking coming soon"
                      className="bg-gray-300 text-white text-xs px-3 py-1 rounded-md cursor-not-allowed"
                    >
                      Coming soon
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          1:1 booking coming soon
        </p>
      </div>
    </div>
  );
}
