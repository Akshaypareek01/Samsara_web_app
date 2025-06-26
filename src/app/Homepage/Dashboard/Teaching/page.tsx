"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  InteractionMode,
} from "chart.js";
import type { ScriptableContext } from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TeachingDashboard = () => {
  // Chart data with gradients
  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3"],
    datasets: [
      {
        label: "Teaching Hours",
        data: [120, 135, 115],
        borderColor: "#10b981",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
          gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.05)");
          return gradient;
        },
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#10b981",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: "Active Students",
        data: [5, 8, 12],
        borderColor: "#3b82f6",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Changed to blue
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.15)"); // Changed to blue
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.05)"); // Changed to blue
          return gradient;
        },
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#3b82f6",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  // Fixed chart options with correct type
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as InteractionMode, // Fixed type issue
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#374151",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 150,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          stepSize: 30,
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: "#ffffff",
        hoverBorderWidth: 3,
      },
    },
  };

  const students = [
    {
      name: "Emma Thompson",
      classes: "24 classes",
      period: "Monthly",
    },
    {
      name: "David Chen",
      classes: "20 classes",
      period: "Monthly",
    },
    {
      name: "Sarah Miller",
      classes: "18 classes",
      period: "Monthly",
    },
    {
      name: "Michael Rodriguez",
      classes: "15 classes",
      period: "Monthly",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Teaching Overview
          </h1>

          {/* Stats Grid - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 1:1 Students */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200/30 h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  1:1 Students
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15</div>
              <div className="text-sm text-blue-600 font-medium">
                Active now
              </div>
            </div>

            {/* Group Students */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-sm border border-purple-200/30 relative h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Group Students
                </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-2">33</div>
              <div className="text-sm text-purple-600 font-medium">
                3 groups
              </div>
            </div>

            {/* Classes This Month */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-sm border border-indigo-200/30 h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Classes This Month
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">32</div>
              <div className="text-sm text-indigo-600 font-medium">
                8 remaining
              </div>
            </div>
          </div>

          {/* Stats Grid - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Active Students */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl shadow-sm border border-cyan-200/30 h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-cyan-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Active Students
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">48</div>
              <div className="text-sm text-cyan-600 font-medium">
                +12% this month
              </div>
            </div>

            {/* Teaching Hours */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-sm border border-green-200/30 h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Teaching Hours
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">64</div>
              <div className="text-sm text-green-600 font-medium">
                This month
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl shadow-sm border border-yellow-200/30 h-38">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Avg. Rating
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="text-sm text-orange-600 font-medium">
                From 156 reviews
              </div>
            </div>
          </div>

          {/* Second Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teaching Stats Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Teaching Stats
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                    Daily
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    Weekly
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    Monthly
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    3 Months
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* 1:1 Students List */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      1:1 Students
                    </h3>
                    <p className="text-sm text-gray-500">This Month</p>
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    See all
                  </button>
                </div>
                <div className="space-y-4">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Attended {student.classes} this month
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-purple-600 font-medium">
                        {student.period}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingDashboard;
