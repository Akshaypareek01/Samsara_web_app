import React from "react";
import { Users, UserCheck, Calendar, Clock, Star } from "lucide-react";

const TeachingDashboard = () => {
  // Sample data for the line chart
  const chartData = [
    { week: "Week 1", value: 120 },
    { week: "Week 2", value: 125 },
    { week: "Week 3", value: 130 },
    { week: "Week 4", value: 115 },
    { week: "Week 5", value: 110 },
  ];

  // Student data
  const students = [
    {
      name: "Emma Thompson",
      classes: "24 classes",
      period: "this month",
      subscription: "Monthly",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "David Chen",
      classes: "20 classes",
      period: "this month",
      subscription: "Monthly",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Sarah Miller",
      classes: "18 classes",
      period: "this month",
      subscription: "Monthly",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
    {
      name: "Michael Rodriguez",
      classes: "15 classes",
      period: "this month",
      subscription: "Monthly",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
  ];

  // Create SVG path for the line chart
  const createPath = () => {
    const width = 400;
    const height = 150;
    const maxValue = Math.max(...chartData.map((d) => d.value));
    const minValue = Math.min(...chartData.map((d) => d.value));
    const range = maxValue - minValue;

    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((d.value - minValue) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Teaching Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Row 1 */}
        <div
          className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">1:1 Students</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">15</span>
            <span className="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
              Active now
            </span>
          </div>
        </div>

        <div
          className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Group Students</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">33</span>
            <span className="bg-purple-200 text-purple-700 text-xs font-medium px-2 py-1 rounded">
              3 groups
            </span>
          </div>
        </div>

        <div
          className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">
              Classes This Month
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">32</span>
            <span className="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
              8 remaining
            </span>
          </div>
        </div>

        {/* Row 2 */}
        <div
          className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Active Students</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">48</span>
            <span className="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded">
              +12% this month
            </span>
          </div>
        </div>

        <div
          className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Teaching Hours</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">64</span>
            <span className="bg-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded">
              This month
            </span>
          </div>
        </div>

        <div
          className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-100"
          style={{ width: "322px", height: "105px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Avg. Rating</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">4.8</span>
            <span className="bg-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
              From 156 reviews
            </span>
          </div>
        </div>
      </div>

      {/* New section with stats and student list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teaching Stats Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Teaching Stats
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded">
                Daily
              </button>
              <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">
                Weekly
              </button>
              <button className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded">
                Monthly
              </button>
              <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">
                6 Months
              </button>
              <button className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded">
                Yearly
              </button>
            </div>
          </div>

          {/* Y-axis labels */}
          <div className="flex items-start mb-4">
            <div className="flex flex-col items-end text-xs text-gray-400 w-8 h-40 justify-between mr-4">
              <span>150</span>
              <span>120</span>
              <span>90</span>
              <span>60</span>
              <span>30</span>
              <span>0</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative h-40">
              <svg
                className="w-full h-full"
                viewBox="0 0 500 160"
                preserveAspectRatio="none"
              >
                {/* Gradient definition */}
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#10b981", stopOpacity: 0.4 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#ffffff", stopOpacity: 0.1 }}
                    />
                  </linearGradient>
                </defs>

                {/* Smooth curved line path */}
                <path
                  d="M 0,40 Q 125,35 250,25 Q 375,20 500,45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Area under the curve with gradient */}
                <path
                  d="M 0,40 Q 125,35 250,25 Q 375,20 500,45 L 500,160 L 0,160 Z"
                  fill="url(#areaGradient)"
                />

                {/* Data points */}
                <circle
                  cx="0"
                  cy="40"
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx="250"
                  cy="25"
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx="500"
                  cy="45"
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-400 ml-12">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
          </div>
        </div>

        {/* 1:1 Students List */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                1:1 Students
              </h2>
              <select className="text-sm text-gray-600 border-none bg-transparent">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {students.map((student, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Attended {student.classes} {student.period}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  {student.subscription}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingDashboard;
