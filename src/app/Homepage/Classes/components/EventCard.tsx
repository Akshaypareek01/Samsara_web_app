"use client";

import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";

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

interface EventCardProps {
  eventItem: EventData;
  joiningEvent: string | null;
  onJoinEvent: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
}

export default function EventCard({ 
  eventItem, 
  joiningEvent, 
  onJoinEvent, 
  onViewDetails 
}: EventCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Event Image */}
      <div className="relative">
        <Image
          src={eventItem.image || "/images/room1.svg"}
          alt={eventItem.eventName}
          width={400}
          height={200}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full font-medium">
          {eventItem.type}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight flex-1">
              {eventItem.eventName}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              eventItem.status 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {eventItem.status ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
            {eventItem.details}
          </p>
          
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{eventItem.teacher.name}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{eventItem.teacher.teacherCategory}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span>{eventItem.startTime}</span>
            <span className="text-gray-300">•</span>
            <span>Max {eventItem.availableseats}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span className="truncate">{new Date(eventItem.startDate).toLocaleDateString()}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">{eventItem.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
              {eventItem.level}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {eventItem.eventmode}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs sm:text-sm text-gray-500">
            {eventItem.students.length} enrolled
          </span>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onViewDetails(eventItem._id)}
              className="text-xs sm:text-sm text-orange-500 font-medium hover:underline focus:outline-none focus:underline"
            >
              Details
            </button>
            {eventItem.status && (
              <button 
                onClick={() => onJoinEvent(eventItem._id)}
                disabled={joiningEvent === eventItem._id}
                className="bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {joiningEvent === eventItem._id ? "Joining..." : "Join"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
