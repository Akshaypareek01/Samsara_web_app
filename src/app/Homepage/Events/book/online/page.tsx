"use client";

import Image from "next/image";
import { CalendarDays, MapPin, Users, Info } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl">
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Events"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
        </div>
        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* Left Section */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Advanced Yoga Flow</h2>
            <p className="text-sm text-gray-600">
              A 90-minute dynamic yoga session focusing on advanced poses and
              transitions. Perfect for experienced practitioners looking to
              deepen their practice.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <CalendarDays className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Date & Time</h4>
                  <p>May 30, 2023 • 6:00 PM - 7:30 PM</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <MapPin className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Location</h4>
                  <p>Harmony Wellness Center, 123 Serenity Ave</p>
                </div>
              </div>

              {/* Class Level */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Info className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Class Level</h4>
                  <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                    Beginner Friendly
                  </span>
                </div>
              </div>

              {/* Available Seats */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Users className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Available Seats</h4>
                  <p>8 seats left out of 20</p>
                </div>
              </div>
            </div>

            {/* Join Now Button */}
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-md text-sm">
              Join Now
            </button>
          </div>

          {/* Moderator Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-3">Moderator</h4>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-[50px] h-[50px] rounded-full shadow-md ring-2 ring-white overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&q=80"
                  alt="Host"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Emily Richardson</p>
                <p className="text-xs text-gray-500">
                  Certified Yoga Instructor • 8+ years
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-snug">
              Specializing in vinyasa flow and advanced postures with a focus on
              alignment and mindfulness.
            </p>
            <button className="w-full bg-orange-500 hover:bg-orange-200 text-white text-sm py-2 rounded-md">
              💬 Chat with Instructor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
