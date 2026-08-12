"use client";

import { Calendar, User } from "lucide-react";

interface StatsSectionProps {
  classesCount: number;
  eventsCount: number;
  attendedCount: number;
  totalHours: number;
}

export default function StatsSection({
  classesCount,
  eventsCount,
  attendedCount,
  totalHours
}: StatsSectionProps) {
 const stats = [
  {
    icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#F38A6A]" />,
    value: classesCount.toString(),
    label: "Classes Booked",
  },
  {
    icon: <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#F38A6A]" />,
    value: eventsCount.toString(),
    label: "Events Booked",
  },
  {
    icon: <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#F38A6A]" />,
    value: attendedCount.toString(),
    label: "Classes Attended",
  },
  {
    icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#F38A6A]" />,
    value: totalHours.toString(),
    label: "Total Hours",
  },
];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="bg-white shadow-sm rounded-xl p-3 flex items-center space-x-3 border border-orange-100/80 hover:shadow-md transition-shadow duration-200"
        >
          <div className="bg-orange-50 rounded-full p-2 flex-shrink-0">
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{item.value}</h2>
            <p className="text-gray-500 text-xs truncate">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
