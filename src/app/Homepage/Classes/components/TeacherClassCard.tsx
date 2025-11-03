"use client";

import Image from "next/image";
import { Calendar, Clock, Users, Play, Trash2, Square, ExternalLink } from "lucide-react";

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

interface TeacherClassCardProps {
  classItem: ClassData;
  onStartClass: (classId: string) => void;
  onJoinClass: (classId: string) => void;
  onEndMeeting: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
  onViewDetails: (classId: string) => void;
  isLoading: boolean;
  loadingAction?: string | null;
}

export default function TeacherClassCard({
  classItem,
  onStartClass,
  onJoinClass,
  onEndMeeting,
  onDeleteClass,
  onViewDetails,
  isLoading,
  loadingAction,
}: TeacherClassCardProps) {
  const hasMeeting = !!classItem.meeting_number;
  const isMeetingActive = hasMeeting && classItem.status;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Class Image */}
      <div className="relative">
        <Image
          src={classItem.image}
          alt={classItem.title}
          width={400}
          height={200}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full font-medium">
          {classItem.classType}
        </span>
        {isMeetingActive && (
          <span className="absolute top-2 left-2 text-xs px-2 py-1 bg-green-500 text-white rounded-full font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight flex-1">
              {classItem.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                classItem.status
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {classItem.status ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
            {classItem.description}
          </p>

          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span>{classItem.students.length} enrolled</span>
            <span className="text-gray-300">•</span>
            <span>Max {classItem.maxCapacity}</span>
          </div>
        </div>

        {/* Class Details */}
        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span>{classItem.duration} min</span>
          </div>

          {classItem.schedules[0] && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">
                {classItem.schedules[0].days.join(", ")}
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate">
                {classItem.schedules[0].startTime} -{" "}
                {classItem.schedules[0].endTime}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {classItem.level.slice(0, 2).map((level, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full"
              >
                {level}
              </span>
            ))}
            {classItem.level.length > 2 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                +{classItem.level.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          <div className="flex gap-2 flex-wrap">
            {!hasMeeting && classItem.status && (
              <button
                onClick={() => onStartClass(classItem._id)}
                disabled={isLoading && loadingAction === "start"}
                className="flex-1 min-w-[120px] bg-green-500 text-white px-3 py-2 rounded-md text-xs sm:text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <Play className="w-3 h-3" />
                {loadingAction === "start" ? "Starting..." : "Start Class"}
              </button>
            )}

            {hasMeeting && classItem.status && (
              <>
                <button
                  onClick={() => onJoinClass(classItem._id)}
                  disabled={isLoading && loadingAction === "join"}
                  className="flex-1 min-w-[120px] bg-blue-500 text-white px-3 py-2 rounded-md text-xs sm:text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  {loadingAction === "join" ? "Joining..." : "Join Meeting"}
                </button>
                <button
                  onClick={() => onEndMeeting(classItem._id)}
                  disabled={isLoading && loadingAction === "end"}
                  className="flex-1 min-w-[120px] bg-red-500 text-white px-3 py-2 rounded-md text-xs sm:text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Square className="w-3 h-3" />
                  {loadingAction === "end" ? "Ending..." : "End Meeting"}
                </button>
              </>
            )}

            <button
              onClick={() => onViewDetails(classItem._id)}
              className="px-3 py-2 text-xs sm:text-sm text-orange-500 font-medium hover:bg-orange-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Details
            </button>
          </div>

          <button
            onClick={() => onDeleteClass(classItem._id)}
            disabled={isLoading && loadingAction === "delete"}
            className="w-full bg-gray-100 text-red-600 px-3 py-2 rounded-md text-xs sm:text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            {loadingAction === "delete" ? "Deleting..." : "Delete Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

