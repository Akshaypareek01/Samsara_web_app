"use client";

import { Calendar, User, Clock } from "lucide-react";

interface StatsSectionProps {
  classesCount: number;
  eventsCount: number;
}

export default function StatsSection({ classesCount, eventsCount }: StatsSectionProps) {
  const stats = [
    {
      icon: <Calendar className="w-6 h-6 text-[#F38A6A]" />,
      value: classesCount.toString(),
      label: "Classes Booked",
    },
    {
      icon: <User className="w-6 h-6 text-[#F38A6A]" />,
      value: eventsCount.toString(),
      label: "Events Booked",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#F38A6A]" />,
      value: "36", // This could be calculated from class durations
      label: "Total Hours",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="bg-white shadow-sm rounded-xl p-4 flex items-center space-x-4 border border-gray-100"
        >
          <div className="bg-[#F38A6A]/10 rounded-full p-2">{item.icon}</div>
          <div>
            <h2 className="text-xl font-semibold">{item.value}</h2>
            <p className="text-gray-500 text-sm">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
