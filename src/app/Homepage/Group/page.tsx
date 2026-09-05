"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/lib/utils";
import { getUserId } from "@/lib/userId";
import { isOwnResource } from "@/lib/isOwnHost";
import { DAY_CHIPS, isUpcomingListing, matchesDayChip, matchesSearch } from "@/lib/listingFilters";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ListingFilterBar from "@/components/ListingFilterBar";
import SectionHeader from "@/components/SectionHeader";
import LetterAvatar from "@/components/LetterAvatar";
import { formatDisplayDateTime } from "@/lib/formatDisplayDate";

interface ClassType {
  _id?: string;
  image?: string;
  title?: string;
  description?: string;
  teacher?: {
    _id?: string;
    id?: string;
    name?: string;
    profileImage?: string;
  };
  schedule?: string;
  type?: string;
  classType?: string;
  level?: string | string[];
  status?: string;
  availableseats?: number;
  startDate?: string;
}

/**
 * Normalizes class level field (string or string[]) for chip filtering.
 * @param level - Class level from API
 */
function normalizeLevel(level?: string | string[]): string {
  if (!level) return "";
  return Array.isArray(level) ? level[0] || "" : level;
}

/**
 * Group classes catalog with enrolled list.
 */
export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [myClasses, setMyClasses] = useState<ClassType[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeAll, setSeeAll] = useState(false);
  const pathname = usePathname();

  const user = JSON.parse(Cookies.get("user") || "{}");
  const studentId = getUserId(user);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError("");
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(`${BASE_URL}/classes/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const classArray = data.data || [];
        setClasses(classArray);
      } catch {
        setError("Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!studentId) return;
    const fetchMyClasses = async () => {
      try {
        const token = Cookies.get("accessToken");
        const res = await fetch(
          `${BASE_URL}/classes/student/${studentId}/classes/upcoming`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setMyClasses(data.data || []);
      } catch (err) {
        console.error("Failed to fetch my classes", err);
      }
    };
    fetchMyClasses();
  }, [studentId, pathname]);

  const levelOptions = useMemo(() => {
    const levels = Array.from(
      new Set(
        classes
          .map((c) => normalizeLevel(c.level))
          .filter((l) => l.length > 0),
      ),
    );
    return levels.length > 0 ? ["All", ...levels] : [];
  }, [classes]);

  const typeOptions = useMemo(() => {
    const types = Array.from(
      new Set(
        classes
          .map((c) => c.classType || c.type)
          .filter((t): t is string => !!t),
      ),
    );
    return types.length > 0 ? ["All", ...types] : [];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const dateRaw = classItem.startDate || classItem.schedule;
      if (!isUpcomingListing(dateRaw)) return false;
      if (!matchesDayChip(dateRaw, selectedFilter)) return false;
      if (
        !matchesSearch(searchQuery, [
          classItem.title,
          classItem.description,
          classItem.teacher?.name,
        ])
      ) {
        return false;
      }
      const level = normalizeLevel(classItem.level);
      if (levelFilter !== "All" && level !== levelFilter) return false;
      const typeVal = classItem.classType || classItem.type || "";
      if (typeFilter !== "All" && typeVal !== typeFilter) return false;
      return true;
    });
  }, [classes, selectedFilter, searchQuery, levelFilter, typeFilter]);

  const visible = seeAll ? filteredClasses : filteredClasses.slice(0, 6);

  const upcomingMyClasses = useMemo(
    () =>
      myClasses.filter((c) => isUpcomingListing(c.startDate || c.schedule)),
    [myClasses],
  );

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-orange-100/60 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#ff9468] shadow-[0_4px_20px_rgba(255,148,104,0.3)] px-6 sm:px-8 py-6 sm:py-7">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                Group Classes
              </h2>
              <p className="text-sm text-white/90">
                Practise together, heal together.
              </p>
            </div>
            <span className="shrink-0 bg-white text-[#c2410c] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {filteredClasses.length} classes
            </span>
          </div>
        </div>

        <ListingFilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search classes, instructors…"
          onSearchChange={setSearchQuery}
          dayOptions={DAY_CHIPS}
          daySelected={selectedFilter}
          onDaySelect={setSelectedFilter}
          levelOptions={levelOptions}
          levelSelected={levelFilter}
          onLevelSelect={setLevelFilter}
          typeOptions={typeOptions}
          typeSelected={typeFilter}
          onTypeSelect={setTypeFilter}
          typeLabel="Format"
          resultCount={filteredClasses.length}
          resultNoun="class"
          onClear={() => {
            setSearchQuery("");
            setSelectedFilter("All");
            setLevelFilter("All");
            setTypeFilter("All");
          }}
        />

        <section className="space-y-3">
          <SectionHeader
            title="Online Classes"
            showAction={filteredClasses.length > 6}
            actionLabel={seeAll ? "Show less" : "See all"}
            onAction={() => setSeeAll((v) => !v)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[260px] rounded-xl bg-orange-50/60 animate-pulse"
                />
              ))
            ) : error ? (
              <div className="col-span-full">
                <EmptyState
                  message={error}
                  actionLabel="Retry"
                  onAction={() => window.location.reload()}
                />
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  message={
                    selectedFilter === "All"
                      ? "No upcoming classes."
                      : `No upcoming classes for ${selectedFilter.toLowerCase()}.`
                  }
                />
              </div>
            ) : (
              visible.map((item, i) => {
                const own = isOwnResource(user, item.teacher);
                return (
                  <article
                    key={item._id || i}
                    className="rounded-xl border border-orange-100/80 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-[140px] w-full">
                      <Image
                        src={item.image || "/images/class1.svg"}
                        alt={item.title || "Class Thumbnail"}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                      {item.status === "live" ? (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3.5 space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {item.title || "Untitled Class"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <LetterAvatar
                          name={item.teacher?.name || "Instructor"}
                          src={item.teacher?.profileImage}
                          size={22}
                        />
                        <span className="truncate">
                          with {item.teacher?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} aria-hidden />
                          {formatDisplayDateTime(
                            item.schedule || item.startDate,
                            "No schedule",
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign size={13} aria-hidden />
                          {item.type === "free" ? "Free" : "Paid"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Users size={13} aria-hidden />
                          {item.availableseats || 0} spots
                        </span>
                        {own ? (
                          <span className="text-xs font-medium text-orange-600 px-2 py-1.5">
                            Host
                          </span>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`View ${item.title || "class"}`}
                          onClick={() =>
                            router.push(
                              `/Homepage/Group/Details?classId=${item._id}&studentId=${studentId}`,
                            )
                          }
                          className="bg-[#ed662e] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-[#c95520] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#ffe0d0] bg-[#fff4ef]/50 p-4 space-y-3">
          <SectionHeader title="My Classes" showAction={false} />
          {upcomingMyClasses.length === 0 ? (
            <EmptyState
              message="No enrolled classes yet."
              actionLabel="Browse classes"
              onAction={() => setSelectedFilter("All")}
            />
          ) : (
            <ul className="space-y-2">
              {upcomingMyClasses.map((classItem, index) => (
                <li
                  key={classItem._id || index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white rounded-lg border border-orange-50 px-3 py-2.5"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <Image
                      src={classItem.image || "/images/class1.svg"}
                      alt={classItem.title || "Class Thumbnail"}
                      width={44}
                      height={44}
                      className="rounded-lg object-cover w-11 h-11 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {classItem.title || "Class"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDisplayDateTime(classItem.startDate, "No date")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/Homepage/Group/Details?classId=${classItem._id}&studentId=${studentId}`,
                      )
                    }
                    className="text-sm border border-gray-200 px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                  >
                    Details
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
