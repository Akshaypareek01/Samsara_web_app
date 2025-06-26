"use client";

import Image from "next/image";
import { Clock, Calendar, Users, Star } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-6xl space-y-10">
        {/* Banner Section */}
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
          <Image
            src="/images/peoples.svg"
            alt="Upcoming Events"
            layout="fill"
            objectFit="cover"
            className="brightness-[0.6] rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-start px-8">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-1">Group Classes</h2>
              <p className="text-sm">Practise Together, heal together.</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
            15+ Events Today
          </div>
        </div>

        {/* Class Info Section */}
        <div className="space-y-4">
          {/* Title and Tags */}
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold">Advanced Vinyasa Flow</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
              Intermediate
            </span>
            <div className="flex items-center text-yellow-500 text-sm gap-1">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              <span>4.5</span>
              <span className="text-gray-500">(126)</span>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-700 mt-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>60 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Mon, Wed, Fri</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Max 12 people</span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-4 gap-6 pt-6 text-sm text-gray-800">
            {/* Class Details */}
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-semibold">Class Details</h4>
              <p>
                A dynamic practice that combines breath with movement. This
                class focuses on building strength, flexibility and balance
                through a sequence of poses that flow together.
              </p>
            </div>

            {/* Instructor Info */}
            <div className="col-span-2 space-y-3">
              <h4 className="font-semibold">Your Instructor</h4>
              <div className="flex items-center gap-4">
                <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&q=80"
                    alt="Instructor"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">Emily Richardson</p>
                  <p className="text-xs text-gray-500">Senior Yoga Teacher</p>
                  <p className="text-xs text-gray-500">
                    👩‍🏫 Trainer since Nov, 2013
                  </p>
                  <p className="text-xs text-gray-500">
                    📜 Certified RYT-500 Instructor
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Columns */}
          <div className="grid md:grid-cols-3 gap-6 pt-4 text-sm text-gray-800">
            <div>
              <h4 className="font-semibold mb-1">Perfect For You If…</h4>
              <p>
                Ideal for intermediate yogis craving a stronger flow, deeper
                transitions, and next-level postures.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Skip This If You’re New</h4>
              <p>
                Not suited for complete beginners or anyone needing a slow,
                gentle, or injury-safe practice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">What You’ll Gain</h4>
              <p>
                Builds strength, flexibility, and inner calm while connecting
                you with a vibrant yoga tribe.
              </p>
            </div>
          </div>

          {/* Class Schedule Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Class Schedule</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">
                        Advanced Vinyasa Flow
                      </h4>
                      <p className="text-xs text-gray-500">
                        Monday, Wednesday, Friday
                      </p>
                      <p className="text-sm font-medium mt-1">
                        7:00 AM - 8:00 AM
                      </p>
                    </div>
                    <span className="text-green-600 bg-green-100 text-xs px-3 py-1 rounded-full font-medium">
                      5 spots left
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
                      Intermediate
                    </span>
                    <span className="text-xs text-gray-500">60 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Schedule Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Class Schedule</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">
                        Advanced Vinyasa Flow
                      </h4>
                      <p className="text-xs text-gray-500">
                        Monday, Wednesday, Friday
                      </p>
                      <p className="text-sm font-medium mt-1">
                        7:00 AM - 8:00 AM
                      </p>
                    </div>
                    <span className="text-green-600 bg-green-100 text-xs px-3 py-1 rounded-full font-medium">
                      5 spots left
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
                      Intermediate
                    </span>
                    <span className="text-xs text-gray-500">60 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full bg-[#EB855F] hover:bg-orange-600 text-white text-sm font-medium py-3 rounded-md transition">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
