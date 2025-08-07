"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Droplets,
  Calendar,
  Trash2,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { BASE_URL } from "../../../../lib/utils";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WaterEntry {
  id: string;
  amount: number;
  time: string;
}

interface HydrationStatus {
  currentIntake: number;
  targetMl: number;
  targetGlasses: number;
  percentage: number;
  status: string;
  remainingMl: number;
  remainingGlasses: number;
  intakeTimeline: WaterEntry[];
  date: string;
}

const WaterTracker: React.FC = () => {
  const [currentDate] = useState("June 15, 2025");
  const [activeView, setActiveView] = useState<string>("Week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [hydrationData, setHydrationData] = useState<HydrationStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hydration data from API
  useEffect(() => {
    const fetchHydrationData = async () => {
      try {
        setLoading(true);

        // Get access token from cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
          return null;
        };

        const accessToken = getCookie("accessToken");

        if (!accessToken) {
          throw new Error("No access token found. Please login again.");
        }

        const response = await fetch(
          `${BASE_URL}/trackers/water/hydration-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: HydrationStatus = await response.json();
        setHydrationData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching hydration data:", err);
        if (err instanceof Error && err.message.includes("Authentication")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load hydration data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHydrationData();
  }, []);

  // Use API data - no dummy data
  const todaysEntries = hydrationData?.intakeTimeline || [];

  const weeklyData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Water Intake (ml)",
        data: [1200, 900, 1800, 2250, 1600, 1800, 1400],
        backgroundColor: (context: { parsed: { y: number } }) => {
          const value = context.parsed.y;
          if (value >= 2000) return "#3B82F6"; // Blue for target reached
          return "#93C5FD"; // Light blue for under target
        },
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#374151",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#3B82F6",
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number } }) =>
            `${context.parsed.y} ml`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 2500,
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          callback: function (value: string | number) {
            return value + " ml";
          },
          stepSize: 500,
        },
      },
    },
  };

  const totalToday = hydrationData?.currentIntake || 0;
  const dailyGoal = hydrationData?.targetMl || 2000;
  const weeklyTotal = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0);
  const dailyAverage = Math.round(weeklyTotal / 7);
  const bestDay = Math.max(...weeklyData.datasets[0].data);
  const currentStreak = 5;

  const quickAmounts = [250, 500, 750, 1000];

  const handleQuickAdd = (amount: number) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      time: timeString,
    };

    // Update local state for immediate UI feedback
    if (hydrationData) {
      setHydrationData({
        ...hydrationData,
        currentIntake: hydrationData.currentIntake + amount,
        remainingMl: Math.max(0, hydrationData.remainingMl - amount),
        intakeTimeline: [...hydrationData.intakeTimeline, newEntry],
      });
    }
  };

  const handleCustomAdd = () => {
    if (customAmount && parseInt(customAmount) > 0) {
      handleQuickAdd(parseInt(customAmount));
      setCustomAmount("");
      setShowAddModal(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (hydrationData) {
      const entryToDelete = hydrationData.intakeTimeline.find(
        (entry) => entry.id === id
      );
      if (entryToDelete) {
        setHydrationData({
          ...hydrationData,
          currentIntake: Math.max(
            0,
            hydrationData.currentIntake - entryToDelete.amount
          ),
          remainingMl: hydrationData.remainingMl + entryToDelete.amount,
          intakeTimeline: hydrationData.intakeTimeline.filter(
            (entry) => entry.id !== id
          ),
        });
      }
    }
  };

  const getProgressPercentage = () => {
    return Math.min((totalToday / dailyGoal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hydration data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Water Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center mb-4">
              <Droplets className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Add Water</h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Add
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      handleQuickAdd(amount);
                      setShowAddModal(false);
                    }}
                    className="p-3 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 font-medium transition-colors"
                  >
                    {amount} ml
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="1"
                  max="2000"
                />
                <button
                  onClick={handleCustomAdd}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white min-h-screen shadow-xl relative">
        {/* Header with Progress */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Today&apos;s Goal</h1>
            {hydrationData && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hydrationData.status === "Hydrated"
                    ? "bg-green-500"
                    : hydrationData.status === "Dehydrated"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {hydrationData.status}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-3xl font-bold">{totalToday}</span>
              <span className="text-lg">ml</span>
              <span className="text-sm opacity-80">/ {dailyGoal} ml</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-2">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>

            <div className="text-sm opacity-90">
              {hydrationData && hydrationData.remainingMl > 0
                ? `${hydrationData.remainingMl} ml to go`
                : "Goal achieved! 🎉"}
            </div>
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Today&apos;s Timeline
            </h2>
            <span className="text-sm text-gray-500">{currentDate}</span>
          </div>

          <div className="space-y-3 mb-6">
            {todaysEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {entry.amount}ml
                    </div>
                    <div className="text-xs text-gray-500">{entry.time}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAdd(amount)}
                className="p-4 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Droplets className="h-4 w-4" />
                <span>{amount} ml</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white border-t border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Weekly Summary</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
              Details
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>June 9 - June 15</span>
            </div>

            <div className="flex bg-gray-100 rounded-full p-0.5">
              {["Week", "Month"].map((period) => (
                <button
                  key={period}
                  onClick={() => setActiveView(period)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                    activeView === period
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 mb-6">
            <Bar data={weeklyData} options={chartOptions} />
          </div>

          {/* Target Line Indicator */}
          <div className="flex items-center justify-end mb-6 text-xs text-gray-500">
            <div className="w-4 h-0.5 bg-gray-400 mr-2"></div>
            <span>Target: {dailyGoal.toLocaleString()}ml</span>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {dailyAverage.toLocaleString()}ml
              </div>
              <div className="text-xs text-gray-600">Daily Average</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {bestDay.toLocaleString()}ml
              </div>
              <div className="text-xs text-gray-600">Best Day</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-2">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {currentStreak} days
              </div>
              <div className="text-xs text-gray-600">Streak</div>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-white p-6 border-t border-gray-100 mb-16">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Hydration Tips
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                <Droplets className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm mb-1">
                  Start Your Day
                </div>
                <div className="text-sm text-gray-600">
                  Drink a glass of water when you wake up to kickstart your
                  metabolism.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm mb-1">
                  Set Reminders
                </div>
                <div className="text-sm text-gray-600">
                  Use hourly reminders to maintain consistent water intake
                  throughout the day.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm mb-1">
                  Listen to Your Body
                </div>
                <div className="text-sm text-gray-600">
                  Increase intake during exercise, hot weather, or when you feel
                  thirsty.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default WaterTracker;
