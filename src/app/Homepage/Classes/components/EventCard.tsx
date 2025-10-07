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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4">
      {/* Event Image */}
      <div className="relative">
        <Image
          src={eventItem.image || "/images/room1.svg"}
          alt={eventItem.eventName}
          width={400}
          height={200}
          className="w-full h-40 object-cover rounded-lg"
        />
        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/90 text-gray-700 rounded-full">
          {eventItem.type}
        </span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[16px] text-gray-900">
            {eventItem.eventName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{eventItem.details}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{eventItem.teacher.name}</span>
            <span className="text-gray-300">•</span>
            <span>{eventItem.teacher.teacherCategory}</span>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${
          eventItem.status 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {eventItem.status ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Event Details */}
      <div className="text-sm text-gray-600 space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <span>{eventItem.startTime}</span>
          <span className="text-gray-300">•</span>
          <span>Max {eventItem.availableseats} participants</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>{new Date(eventItem.startDate).toLocaleDateString()}</span>
          <span className="text-gray-300">•</span>
          <span>{eventItem.location}</span>
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
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {eventItem.students.length} enrolled
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onViewDetails(eventItem._id)}
            className="text-sm text-orange-500 font-medium hover:underline"
          >
            View Details
          </button>
          {eventItem.status && (
            <button 
              onClick={() => onJoinEvent(eventItem._id)}
              disabled={joiningEvent === eventItem._id}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joiningEvent === eventItem._id ? "Joining..." : "Join Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
