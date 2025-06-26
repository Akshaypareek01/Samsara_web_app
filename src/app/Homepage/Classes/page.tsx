// app/my-classes/page.tsx

import Image from "next/image";
import { Calendar, User, Clock } from "lucide-react";

export default function MyClassesPage() {
  const stats = [
    {
      icon: <Calendar className="w-6 h-6 text-[#F38A6A]" />,
      value: "24",
      label: "Classes Booked",
    },
    {
      icon: <User className="w-6 h-6 text-[#F38A6A]" />,
      value: "18",
      label: "Classes Attended",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#F38A6A]" />,
      value: "36",
      label: "Total Hours",
    },
  ];

  const classItems = [
    {
      image: "/images/room4.svg",
      title: "Upcoming Classes",
      subtitle: "15 Classes",
    },
    {
      image: "/images/room3.svg",
      title: "Past Classes",
      subtitle: "28 Classes",
    },
    {
      image: "/images/room2.svg",
      title: "Favorites",
      subtitle: "12 Items",
    },
    {
      image: "/images/room1.svg",
      title: "Class Wraps",
      subtitle: "6 Materials",
    },
  ];

  return (
    <div className="p-6 md:p-12 bg-white">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">My Classes</h1>
      <p className="text-gray-500 mb-6">Track your learning progress</p>

      {/* Stats Section */}
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

      {/* Class Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={500}
              height={300}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 text-center">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Todays Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#FEEFE9]">
                      <div className="w-4 h-4 border-2 border-[#F38A6A] rounded-full" />
                    </div>
                    <h3 className="font-semibold text-[16px] text-gray-900">
                      Morning Flow Yoga
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500  ml-12">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>07:00 AM</span>
                    <User className="w-4 h-4 text-gray-400 ml-2" />
                    <span>Sarah Wilson</span>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full">
                  In Progress
                </span>
              </div>

              {/* Time and Location */}
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>07:00 - 08:30 AM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Sarah Wilson</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 12l4.243-4.243m0 8.486L9.172 4.929a4 4 0 015.656-5.656l8.485 8.485a4 4 0 01-5.656 5.656z"
                    />
                  </svg>
                  <span>Studio A</span>
                </div>
              </div>

              {/* Avatars + Link */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex -space-x-2">
                  <Image
                    src="https://randomuser.me/api/portraits/women/1.jpg"
                    alt="avatar1"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white"
                  />
                  <Image
                    src="https://randomuser.me/api/portraits/men/2.jpg"
                    alt="avatar2"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white"
                  />
                  <Image
                    src="https://randomuser.me/api/portraits/women/3.jpg"
                    alt="avatar3"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white"
                  />
                  <span className="text-xs text-gray-500 pl-2">+12 more</span>
                </div>
                <button className="text-sm text-orange-500 font-medium hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
