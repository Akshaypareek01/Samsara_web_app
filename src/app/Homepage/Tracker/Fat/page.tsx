"use client";
import * as React from "react";
import { useState, useEffect } from "react";
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
} from "chart.js";
import {
  Plus,
  Activity,
  Heart,
  AlertTriangle,
  Target,
  Apple,
  Dumbbell,
  Lightbulb,
} from "lucide-react";
import { BASE_URL } from "../../../../lib/utils";

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

interface FatMeasurement {
  bodyFat: {
    value: number;
    unit: string;
  };
  isActive: boolean;
  userId: string;
  age: number;
  gender: string;
  notes: string;
  measurementDate: string;
  id: string;
}

interface FatData {
  labels: string[];
  data: number[];
}

interface PeriodData {
  [key: string]: FatData;
}

const FatTracker: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>("3M");
  const [showModal, setShowModal] = useState(false);
  const [newFatPercentage, setNewFatPercentage] = useState("");
  const [date, setDate] = useState("");
  const [fatData, setFatData] = useState<FatMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Fat data from API
  useEffect(() => {
    const fetchFatData = async () => {
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

        const response = await fetch(`${BASE_URL}/trackers/fat/history`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FatMeasurement[] = await response.json();
        setFatData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching Fat data:", err);
        if (err instanceof Error && err.message.includes("Authentication")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load Fat data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFatData();
  }, []);

  // Process API data for chart
  const processChartData = (): PeriodData => {
    if (!fatData.length) {
      return {
        "1Y": { labels: [], data: [] },
        "6M": { labels: [], data: [] },
        "3M": { labels: [], data: [] },
        "1M": { labels: [], data: [] },
      };
    }

    // Sort data by date (newest first)
    const sortedData = [...fatData].sort(
      (a, b) =>
        new Date(b.measurementDate).getTime() -
        new Date(a.measurementDate).getTime()
    );

    // Get the most recent measurements based on period
    const now = new Date();
    let filteredData: FatMeasurement[] = [];

    switch (activePeriod) {
      case "1Y":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return (
            now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000
          );
        });
        break;
      case "6M":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return (
            now.getTime() - itemDate.getTime() <= 180 * 24 * 60 * 60 * 1000
          );
        });
        break;
      case "3M":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return now.getTime() - itemDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        });
        break;
      case "1M":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      default:
        filteredData = sortedData.slice(0, 10); // Default to last 10 measurements
    }

    // Take the most recent 6-8 measurements for chart
    const chartData = filteredData.slice(0, 8).reverse();

    const labels = chartData.map((item) => {
      const date = new Date(item.measurementDate);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    const data = chartData.map((item) => item.bodyFat.value);

    return {
      [activePeriod]: {
        labels,
        data,
      },
    };
  };

  const periodData = processChartData();
  const currentData = periodData[activePeriod];
  const currentFat =
    currentData.data.length > 0
      ? currentData.data[currentData.data.length - 1]
      : 0;
  const previousFat =
    currentData.data.length > 1
      ? currentData.data[currentData.data.length - 2]
      : currentFat;
  const fatChange = currentFat - previousFat;

  const getHealthRange = (fatPercentage: number) => {
    // Assuming male ranges - can be adjusted
    if (fatPercentage <= 6)
      return { range: "Athlete", color: "blue", icon: "💪" };
    if (fatPercentage <= 13)
      return { range: "Fitness", color: "green", icon: "✅" };
    if (fatPercentage <= 17)
      return { range: "Acceptable", color: "orange", icon: "⚠️" };
    return { range: "Above Range", color: "red", icon: "❌" };
  };

  const healthStatus = getHealthRange(currentFat);

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: "Body Fat %",
        data: currentData.data,
        borderColor: "#F97316",
        backgroundColor: (context: {
          chart: {
            ctx: CanvasRenderingContext2D;
            chartArea: { top: number; bottom: number } | null;
          };
        }) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.3)");
          gradient.addColorStop(1, "rgba(249, 115, 22, 0.05)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#F97316",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
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
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#F97316",
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number } }) =>
            `${context.parsed.y.toFixed(1)}% Body Fat`,
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
          color: "#666",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: false,
        min:
          currentData.data.length > 0 ? Math.min(...currentData.data) - 1 : 0,
        max:
          currentData.data.length > 0 ? Math.max(...currentData.data) + 1 : 30,
        grid: {
          color: "#f0f0f0",
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#666",
          font: {
            size: 11,
          },
          callback: function (value: string | number) {
            return Number(value).toFixed(1) + "%";
          },
        },
      },
    },
  };

  const handleAddMeasurement = () => {
    setShowModal(true);
  };

  const handleSaveMeasurement = () => {
    if (newFatPercentage && date) {
      alert(
        `New body fat measurement saved!\nBody Fat: ${newFatPercentage}%\nDate: ${date}`
      );
      setShowModal(false);
      setNewFatPercentage("");
      setDate("");
    }
  };

  // Auto-set date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, [showModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Fat data...</p>
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
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Measurement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add Body Fat Measurement
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Fat Percentage (%)
              </label>
              <input
                type="number"
                value={newFatPercentage}
                onChange={(e) => setNewFatPercentage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="19.5"
                min="5"
                max="50"
                step="0.1"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeasurement}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Save Measurement
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white min-h-screen shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Body Fat Tracker</h1>
          <button
            onClick={handleAddMeasurement}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Progress</h2>

          <div className="flex bg-gray-100 rounded-full p-0.5 mb-6">
            {["1Y", "6M", "3M", "1M"].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-full transition-all duration-300 ${
                  activePeriod === period
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="h-64 mb-4">
            {currentData.data.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No Fat data available for this period
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-800">
              {currentFat}%
            </div>
            <div className="text-sm text-gray-600">Current Body Fat</div>
            {fatChange !== 0 && (
              <div
                className={`text-sm font-medium ${
                  fatChange < 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {fatChange < 0 ? "↓" : "↑"} {Math.abs(fatChange).toFixed(1)}%
                from last measurement
              </div>
            )}
          </div>
        </div>

        {/* Health Range */}
        <div className="bg-white p-6 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Health Range</h2>

          <div className="space-y-3">
            <div
              className={`p-4 rounded-xl border-2 ${
                healthStatus.range === "Athlete"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Athlete</div>
                    <div className="text-sm text-gray-600">2-5%</div>
                  </div>
                </div>
                <div className="text-blue-600 font-bold">💪</div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 ${
                healthStatus.range === "Fitness"
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Fitness</div>
                    <div className="text-sm text-gray-600">6-13%</div>
                  </div>
                </div>
                <div className="text-green-600 font-bold">✅</div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 ${
                healthStatus.range === "Acceptable"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Acceptable</div>
                    <div className="text-sm text-gray-600">14-17%</div>
                  </div>
                </div>
                <div className="text-orange-600 font-bold">⚠️</div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 ${
                healthStatus.range === "Above Range"
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Above Range</div>
                    <div className="text-sm text-gray-600">18%+</div>
                  </div>
                </div>
                <div className="text-red-600 font-bold">❌</div>
              </div>
            </div>
          </div>
        </div>

        {/* Measurement History */}
        <div className="bg-white p-6 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Measurement History
          </h2>

          <div className="space-y-3">
            {fatData.length > 0 ? (
              fatData.slice(0, 6).map((entry, index) => {
                const date = new Date(entry.measurementDate);
                const change =
                  index < fatData.length - 1
                    ? entry.bodyFat.value - fatData[index + 1].bodyFat.value
                    : 0;

                return (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {date.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Body fat measurement
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {entry.bodyFat.value}%
                      </div>
                      {change !== 0 && (
                        <div
                          className={`text-xs font-medium ${
                            change < 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                No measurement history available
              </div>
            )}
          </div>
        </div>

        {/* Tips & Info */}
        <div className="bg-white p-6 border-t border-gray-100 mb-16">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Tips & Info</h2>
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Learn More
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Tracking Accuracy
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Use the same measurement method, time of day, and conditions
                    for consistent tracking. Measurements are most accurate when
                    taken in the morning before eating.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                  <Apple className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Healthy Exercise
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Combine strength training with cardio to optimize fat loss
                    while preserving muscle mass. Focus on progressive overload.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                  <Dumbbell className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Consistency
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Track your body fat percentage weekly or bi-weekly for the
                    best trends. Daily fluctuations are normal and
                    shouldn&apos;t cause concern.
                  </div>
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

export default FatTracker;
