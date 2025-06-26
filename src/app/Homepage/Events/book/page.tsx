"use client";

import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Home,
  Lightbulb,
  Lock,
  Share2,
  Timer,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-8">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Events"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
        </div>

        {/* Host Info and Buttons Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4">
          {/* Left side: Host image and title */}
          <div className="flex items-center gap-4">
            <div className="relative w-[60px] h-[60px] rounded-full shadow-md ring-2 ring-white overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&q=80"
                alt="Host"
                layout="fill"
                objectFit="cover"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Digital Zen: Meditation Journey
              </h2>
              <p className="text-gray-600 text-sm">
                Join our virtual sanctuary for a guided meditation session
              </p>
            </div>
          </div>

          {/* Right side: Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 text-sm">
              <Share2 size={16} /> Share
            </button>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm shadow cursor-pointer"
              onClick={() => router.push("/Homepage/Events/book/online")}
            >
              📅 Register Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Live Stream */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  fill="#2563eb"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 16.5l6-4.5-6-4.5v9z" />
                  <path d="M22 3H2v18h20V3zm-2 16H4V5h16v14z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Live Stream</h4>
                <p className="text-xs text-gray-500">Samsara Platform</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Monday, May 26, 2025
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> 7:30 AM - 8:45 AM
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" /> 75 minutes
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Capacity</h4>
                <p className="text-xs text-gray-500">Limited Spots</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> 15 Spots Left
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Max 30 people
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> All Levels Welcome
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  fill="#f59e0b"
                  viewBox="0 0 24 24"
                >
                  <path d="M11 9h2v5h-2zm0 6h2v2h-2z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Requirements</h4>
                <p className="text-xs text-gray-500">What You Need</p>
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Stable internet connection
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Quiet space
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Headphones recommended
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* About This Event */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">About This Event</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Experience deep relaxation and inner peace from the comfort of
              your home. This virtual meditation session combines ancient wisdom
              with modern mindfulness techniques, creating a unique journey of
              self-discovery and tranquility. Perfect for both beginners and
              experienced practitioners, our guided session will help you
              develop a stronger mind-body connection and establish a regular
              meditation practice.
            </p>
          </div>

          {/* Your Host */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3">Your Host</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-[50px] h-[50px] rounded-full shadow-md ring-2 ring-white overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&q=80"
                  alt="Host"
                  fill // ✅ modern replacement for layout="fill"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm">Emma Richardson</p>
                <p className="text-xs text-gray-500">
                  Certified Meditation Instructor & Wellness Coach
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
