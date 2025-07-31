"use client";
import React from "react";
import { Users, MessageCircle, User } from "lucide-react";

export default function ExactDashboard() {
  const handleNavigation = (path) => {
    // In a real app, you would use React Router or Next.js router
    console.log(`Navigating to: ${path}`);
    // For demonstration, you can replace this with actual navigation logic
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Cards Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div
            className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleNavigation("/Homepage/Profile")}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Profile</h3>
                <p className="text-xs text-purple-600">80% complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: "80%" }}
              ></div>
            </div>
          </div>

          {/* Community Card */}
          <div
            className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleNavigation("/Homepage/Dashboard/Community")}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Community</h3>
                <p className="text-xs text-purple-600">125 members</p>
              </div>
            </div>
            <div className="bg-purple-50 px-2 py-1 rounded text-xs text-purple-600 inline-block">
              2 new posts today
            </div>
          </div>

          {/* Chat Card */}
          <div
            className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleNavigation("/Homepage/Dashboard/Chat")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Chat</h3>
                  <p className="text-xs text-green-600">5 unread messages</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Upcoming Sessions
            </h2>

            <div className="space-y-2">
              {/* Monday Session */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-gray-900">Monday, June 23</h3>
                  <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    3 spots left
                  </span>
                  <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium">
                    Join Now
                  </button>
                </div>
              </div>

              {/* Wednesday Session */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Wednesday, June 25
                  </h3>
                  <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                    1 spot left
                  </span>
                  <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium">
                    Join Now
                  </button>
                </div>
              </div>

              {/* Friday Session */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-gray-900">Friday, June 27</h3>
                  <p className="text-sm text-gray-500">7:00 AM - 8:00 AM</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                    Full
                  </span>
                  <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
