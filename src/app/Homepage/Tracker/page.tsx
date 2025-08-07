"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { User, Scale, Thermometer, Droplets, Target, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../../lib/utils";

interface TrackerData {
  weightTracker?: {
    currentWeight: { unit: string; value: number };
    startingWeight: { unit: string; value: number };
    totalLoss: number;
    isActive: boolean;
    goalWeight?: { unit: string; value?: number };
  };
  bmiTracker?: {
    bmi: { value: number; category: string };
    height: { unit: string; value: number };
    weight: { unit: string; value: number };
    age: number;
    gender: string;
    isActive: boolean;
  };
  fatTracker?: {
    bodyFat: { unit: string; value: number };
    height: { unit: string; value: number };
    weight: { unit: string; value: number };
    bmi: { value: number; category: string };
    age: number;
    gender: string;
    goal: number;
    isActive: boolean;
  };
  waterTracker?: {
    totalIntake: number;
    targetMl: number;
    targetGlasses: number;
    status: string;
    dailyAverage: number;
    streak: number;
    bestDay: number;
  };
  sleepTracker?: {
    hoursSlept: number;
    sleepRate: number;
    sleepTime: number;
    bedtime: string;
    wakeUpTime: string;
    goal: number;
  };
  temperatureTracker?: {
    temperature: { value: number; unit: string };
    status: string;
    isActive: boolean;
  };
  bodyStatus?: {
    weight: { value: number; unit: string };
    height: { value: number; unit: string };
    chest?: { unit: string; value?: number };
    waist?: { unit: string; value?: number };
    hips?: { unit: string; value?: number };
    arms?: { unit: string; value?: number };
    thighs?: { unit: string; value?: number };
    bmi: { value: number; category: string };
    bodyFat?: { unit: string; value?: number };
    gender: string;
    isActive: boolean;
  };
  stepTracker?: {
    isActive?: boolean;
  } | null;
}

const HealthTracker = () => {
  const router = useRouter();
  const [trackerData, setTrackerData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        // Get access token from cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
          return null;
        };

        const accessToken = getCookie("accessToken");

        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        const response = await fetch(`${BASE_URL}/trackers/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched tracker data:", data);
        setTrackerData(data);
      } catch (error) {
        console.error("Error fetching tracker data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerData();
  }, []);

  const getTrackerCards = () => {
    if (!trackerData) return [];

    console.log("Creating tracker cards with data:", trackerData);

    return [
      {
        id: 1,
        title: "BMI Tracker",
        icon: <User className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-green-400 to-green-600",
        value: trackerData.bmiTracker
          ? `${trackerData.bmiTracker.bmi.value.toFixed(1)}`
          : "N/A",
        label: "Current BMI",
        status: trackerData.bmiTracker
          ? trackerData.bmiTracker.bmi.category
          : "Not Available",
        path: "/Homepage/Tracker/Bmi",
      },
      {
        id: 2,
        title: "Weight Tracker",
        icon: <Scale className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
        value: trackerData.weightTracker
          ? `${trackerData.weightTracker.startingWeight.value} ${trackerData.weightTracker.startingWeight.unit}`
          : "N/A",
        label: "Starting Weight",
        status: trackerData.weightTracker
          ? trackerData.weightTracker.totalLoss > 0
            ? `${trackerData.weightTracker.totalLoss} kg lost`
            : trackerData.weightTracker.totalLoss < 0
            ? `${Math.abs(trackerData.weightTracker.totalLoss)} kg gained`
            : "Maintaining"
          : "Not Available",
        path: "/Homepage/Tracker/Weight",
      },
      {
        id: 3,
        title: "Temperature",
        icon: <Thermometer className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-red-400 to-red-600",
        value: trackerData.temperatureTracker
          ? `${trackerData.temperatureTracker.temperature.value}°${trackerData.temperatureTracker.temperature.unit}`
          : "N/A",
        label: "Current",
        status: trackerData.temperatureTracker
          ? trackerData.temperatureTracker.status
          : "Not Available",
        path: "/Homepage/Tracker/Temperature",
      },
      {
        id: 4,
        title: "Water Tracker",
        icon: <Droplets className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-cyan-400 to-cyan-600",
        value: trackerData.waterTracker
          ? `${trackerData.waterTracker.totalIntake}/${trackerData.waterTracker.targetMl} ml`
          : "N/A",
        label: "Today's Intake",
        status: trackerData.waterTracker
          ? trackerData.waterTracker.status
          : "Not Available",
        path: "/Homepage/Tracker/water",
      },
      {
        id: 5,
        title: "Fat Tracker",
        icon: <Target className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        value: trackerData.fatTracker
          ? `${trackerData.fatTracker.bodyFat.value}%`
          : "N/A",
        label: "Body Fat",
        status: trackerData.fatTracker
          ? trackerData.fatTracker.bodyFat.value <= 20
            ? "Healthy"
            : trackerData.fatTracker.bodyFat.value <= 25
            ? "Moderate"
            : "High"
          : "Not Available",
        path: "/Homepage/Tracker/Fat",
      },
      {
        id: 6,
        title: "Sleep Tracker",
        icon: <Moon className="w-8 h-8 text-white" />,
        bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        value: trackerData.sleepTracker
          ? `${trackerData.sleepTracker.hoursSlept}h`
          : "N/A",
        label: "Last Night",
        status: trackerData.sleepTracker
          ? trackerData.sleepTracker.sleepRate >= 80
            ? "Good"
            : trackerData.sleepTracker.sleepRate >= 60
            ? "Fair"
            : "Poor"
          : "Not Available",
        path: "/Homepage/Tracker/sleep",
      },
    ];
  };

  const getStatusColor = (status: string) => {
    if (
      status === "Normal" ||
      status === "Good" ||
      status === "Healthy" ||
      status === "Active" ||
      status === "Underweight" ||
      status === "Normal Weight" ||
      status === "Overweight" ||
      status === "Obese" ||
      status === "Fair"
    ) {
      return "text-green-500";
    }
    if (
      status === "Maintaining" ||
      status === "High" ||
      status === "Poor" ||
      status === "Dehydrated" ||
      status === "Moderate"
    ) {
      return "text-orange-500";
    }
    if (
      status === "Inactive" ||
      status === "Not Available" ||
      status === "Not Active"
    ) {
      return "text-gray-500";
    }
    return "text-blue-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracker data...</p>
        </div>
      </div>
    );
  }

  const trackers = getTrackerCards();

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Health Trackers
          </h1>
          <p className="text-gray-600 text-sm">
            Monitor your daily health metrics
          </p>
        </div>

        {/* Tracker Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer h-48 flex flex-col"
              onClick={() => router.push(tracker.path)}
            >
              {/* Icon Section */}
              <div
                className={`${tracker.bgColor} rounded-lg p-3 mb-3 relative`}
              >
                <div className="w-7 h-7">
                  {React.cloneElement(tracker.icon, {
                    className: "w-7 h-7 text-white",
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {tracker.title}
                  </h3>
                  <p className="text-xl font-bold text-gray-900">
                    {tracker.value}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {tracker.label}
                  </p>
                </div>
                <p
                  className={`text-xs font-medium ${getStatusColor(
                    tracker.status
                  )} truncate mb-1`}
                >
                  {tracker.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;
