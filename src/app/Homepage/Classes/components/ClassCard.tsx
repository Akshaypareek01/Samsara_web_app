"use client";

import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";

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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4">
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
            onClick={() => onViewDetails(classItem._id)}
            className="text-sm text-orange-500 font-medium hover:underline"
          >
            View Details
          </button>
          {classItem.status && (
            <button 
              onClick={() => onJoinClass(classItem._id)}
              disabled={joiningClass === classItem._id}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joiningClass === classItem._id ? "Joining..." : "Join Class"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
