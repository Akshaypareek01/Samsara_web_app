"use client";

import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import LetterAvatar from "@/components/LetterAvatar";

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

interface ClassCardProps {
  classItem: ClassData;
  joiningClass: string | null;
  onJoinClass: (classId: string) => void;
  onViewDetails: (classId: string) => void;
}

export default function ClassCard({ 
  classItem, 
  joiningClass, 
  onJoinClass, 
  onViewDetails 
}: ClassCardProps) {
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
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight flex-1">
              {classItem.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              classItem.status 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {classItem.status ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
            {classItem.description}
          </p>
          
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <LetterAvatar
              name={classItem.teacher.name}
              src={classItem.teacher.profileImage}
              size={20}
            />
            <span className="truncate">{classItem.teacher.name}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{classItem.teacher.teacherCategory}</span>
          </div>
        </div>

        {/* Class Details */}
        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span>{classItem.duration} min</span>
            <span className="text-gray-300">•</span>
            <span>Max {classItem.maxCapacity}</span>
          </div>
          
          {classItem.schedules[0] && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">{classItem.schedules[0].days.join(', ')}</span>
              <span className="text-gray-300">•</span>
              <span className="truncate">{classItem.schedules[0].startTime} - {classItem.schedules[0].endTime}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {classItem.level.slice(0, 2).map((level, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
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
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs sm:text-sm text-gray-500">
            {classItem.students.length} enrolled
          </span>
          
          <div className="flex space-x-2 items-center">
            <button 
              type="button"
              onClick={() => onViewDetails(classItem._id)}
              className="text-xs sm:text-sm text-orange-500 font-medium hover:underline focus:outline-none focus:underline"
            >
              Details
            </button>
            {classItem.meeting_number ? (
              <button 
                type="button"
                onClick={() => onJoinClass(classItem._id)}
                disabled={joiningClass === classItem._id}
                className="bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {joiningClass === classItem._id ? "Joining..." : "Join"}
              </button>
            ) : (
              <span className="text-xs text-gray-400 px-2 py-1.5" title="Teacher has not started the meeting yet">
                Not started
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
