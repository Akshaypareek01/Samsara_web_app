"use client";

import Link from "next/link";
import {
  CalendarDays,
  User,
  History,
  ArrowDown,
  ArrowUp,
  HeartPulse,
  Brain,
  Moon,
} from "lucide-react";

export default function MyBodyPage() {
  const measurements = [
    { name: "Height", current: "5’9” cm", cm: "176 cm", change: "+2 cm" },
    { name: "Weight", current: "75 kg", cm: "78 kg", change: "-3 kg" },
    { name: "Chest", current: "75 kg", cm: "78 kg", change: "-3 kg" },
    { name: "Waist", current: "82 cm", cm: "85 cm", change: "-3 cm" },
    { name: "Hips", current: "58 cm", cm: "60 cm", change: "-2 cm" },
    { name: "Arms", current: "36 cm", cm: "35 cm", change: "+1 cm" },
    { name: "Thighs", current: "58 cm", cm: "60 cm", change: "-2 cm" },
    { name: "BMI", current: "88 cm", cm: "92 cm", change: "-4 cm" },
    { name: "Body fat", current: "88 cm", cm: "92 cm", change: "-4 cm" },
  ];

  const conditions = [
    {
      icon: <HeartPulse className="w-4 h-4 text-red-400" />,
      title: "Hypertension",
      desc: "Blood pressure consistently ranging between 130-139/85-89 mmHg. Currently managed with lifestyle modifications.",
      tag: "Moderate",
      tagColor: "bg-yellow-200 text-yellow-800",
      note: "Medication: None",
    },
    {
      icon: <Brain className="w-4 h-4 text-blue-400" />,
      title: "Mild Anxiety",
      desc: "Occasional episodes of anxiety, primarily work-related. Managing through meditation and breathing exercises.",
      tag: "Controlled",
      tagColor: "bg-green-200 text-green-800",
      note: "Therapy: Weekly mindfulness sessions",
    },
    {
      icon: <Moon className="w-4 h-4 text-purple-400" />,
      title: "Sleep Apnea",
      desc: "Moderate obstructive sleep apnea with AHI of 22. Using CPAP therapy with moderate compliance.",
      tag: "Needs Attention",
      tagColor: "bg-red-200 text-red-800",
      note: "Treatment: CPAP therapy",
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-2">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            My Body
          </h1>
          <div className="text-sm text-gray-400 flex items-center space-x-1">
            <Link href="/dashboard" className="hover:text-gray-600 transition">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-orange-500 font-medium">Body Status</span>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[42%_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-2xl p-6 shadow space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Key Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Gender */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-sm">Gender</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">
                    Male
                  </div>
                </div>

                {/* Age */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-sm">Age</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">
                    32 years
                  </div>
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            <div className="bg-white rounded-2xl p-6 shadow space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Body Measurements
                </h2>
                <Link
                  href="#"
                  className="text-orange-500 text-sm flex items-center gap-1 font-medium hover:underline"
                >
                  <History className="w-4 h-4" />
                  View History
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-800">
                  <thead className="text-gray-500 border-b text-xs uppercase">
                    <tr>
                      <th className="py-2 pr-4">Measurement</th>
                      <th className="py-2 pr-4">Current</th>
                      <th className="py-2 pr-4">In CM</th>
                      <th className="py-2">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b last:border-b-0 text-sm"
                      >
                        <td className="py-2 pr-4">{item.name}</td>
                        <td className="py-2 pr-4 font-semibold">
                          {item.current}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">{item.cm}</td>
                        <td className="py-2 font-medium flex items-center gap-1 text-green-500">
                          {item.change.startsWith("+") ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {item.change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Lifestyle Conditions
              </h2>
              {conditions.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                  <p className="text-gray-500 text-xs">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Your Dosha Profile</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src="/images/dosha.svg" // replace with the actual path to your icon
                    alt="Dosha Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Pitta-Vata Body Type
                  </h3>
                  <p className="text-gray-600 mt-1 mb-3">
                    Your dominant doshas are Pitta and Vata, indicating a
                    balanced energy profile with both fire and air elements.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 text-sm rounded-full">
                      Energetic
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 text-sm rounded-full">
                      Creative
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 text-sm rounded-full">
                      Focused
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
