import React from "react";
import { User, Users, MessageCircle } from "lucide-react";

export default function ProfileDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
              <p className="text-sm text-gray-500">80% complete</p>
              <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                <div className="w-4/5 h-full bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Community</h3>
              <p className="text-sm text-gray-500">128 members</p>
              <p className="text-sm text-purple-600 mt-1">2 new posts today</p>
            </div>
          </div>
        </div>

        {/* Chat Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
              <p className="text-sm text-gray-500">5 unread messages</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h2 className="text-xl font-semibold text-gray-800">
            Upcoming Sessions
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: "#E5E7EB" }}>
          {/* Monday Session */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Monday, June 23</h3>
              <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                3 spots left
              </span>
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                Join Now
              </button>
            </div>
          </div>

          {/* Wednesday Session */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                Wednesday, June 25
              </h3>
              <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                1 spot left
              </span>
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                Join Now
              </button>
            </div>
          </div>

          {/* Friday Session */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Friday, June 27</h3>
              <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                Full
              </span>
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
