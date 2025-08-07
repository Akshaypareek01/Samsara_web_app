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

interface WeightMeasurement {
  height: {
    unit: string;
    value: number;
  };
  weight: {
    unit: string;
    value: number;
  };
  bmi: {
    value: number;
    category: string;
  };
  isActive: boolean;
  userId: string;
  age: number;
  gender: string;
  notes: string;
  measurementDate: string;
  id: string;
}

interface WeightMeasurement {
  height: {
    unit: string;
    value: number;
  };
  weight: {
    unit: string;
    value: number;
  };
  bmi: {
    value: number;
    category: string;
  };
  isActive: boolean;
  userId: string;
  age: number;
  gender: string;
  notes: string;
  measurementDate: string;
  id: string;
}

interface WeightData {
  labels: string[];
  data: number[];
}

interface PeriodData {
  [key: string]: WeightData;
}

const WeightTracker: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>("3M");
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [date, setDate] = useState("");
  const [weightData, setWeightData] = useState<WeightMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch weight data from API
  useEffect(() => {
    const fetchWeightData = async () => {
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

        const response = await fetch(`${BASE_URL}/trackers/bmi/history`, {
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

        const data: WeightMeasurement[] = await response.json();
        setWeightData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching weight data:", err);
        if (err instanceof Error && err.message.includes("Authentication")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load weight data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  }, []);
  useEffect(() => {
    const fetchWeightData = async () => {
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

        const response = await fetch(`${BASE_URL}/trackers/bmi/history`, {
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

        const data: WeightMeasurement[] = await response.json();
        setWeightData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching weight data:", err);
        if (err instanceof Error && err.message.includes("Authentication")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load weight data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  }, []);

  // Process API data for chart
  const processChartData = (): PeriodData => {
    if (!weightData.length) {
      return {
        "1Y": { labels: [], data: [] },
        "3M": { labels: [], data: [] },
        "1M": { labels: [], data: [] },
      };
    }

    // Sort data by date (newest first)
    const sortedData = [...weightData].sort(
      (a, b) =>
        new Date(b.measurementDate).getTime() -
        new Date(a.measurementDate).getTime()
    );

    // Get the most recent measurements based on period
    const now = new Date();
    let filteredData: WeightMeasurement[] = [];

    switch (activePeriod) {
      case "1Y":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return (
            now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000
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

    const data = chartData.map((item) => item.weight.value);

    return {
      [activePeriod]: {
        labels,
        data,
      },
    };
  };

  const periodData = processChartData();
  const currentData = periodData[activePeriod];
  const currentWeight = weightData.length > 0 ? weightData[0].weight.value : 0;
  const prevWeight =
    weightData.length > 1 ? weightData[1].weight.value : currentWeight;
  const weightChange = currentWeight - prevWeight;
  const goalWeight = 160;
  const weightToGoal = currentWeight - goalWeight;

  // Calculate BMI from current weight and height
  const bmi = weightData.length > 0 ? weightData[0].bmi.value : 0;

  const getProgressStatus = () => {
    if (weightChange < -1) return "Excellent Progress";
    if (weightChange < 0) return "Good Progress";
    if (weightChange === 0) return "Maintaining";
    return "Gaining Weight";
  };

  const getProgressColor = () => {
    if (weightChange < -1) return "text-green-600";
    if (weightChange < 0) return "text-blue-600";
    if (weightChange === 0) return "text-yellow-600";
    return "text-red-600";
  };

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: "Weight (kg)",
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
            `Weight: ${context.parsed.y} kg`,
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
          currentData.data.length > 0 ? Math.min(...currentData.data) - 5 : 0,
        max:
          currentData.data.length > 0 ? Math.max(...currentData.data) + 5 : 100,
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
            return value + " kg";
          },
        },
      },
    },
  };

  const handleSaveWeight = () => {
    if (newWeight && date) {
      alert(
        `New weight measurement saved!\nWeight: ${newWeight} kg\nDate: ${date}`
      );
      setShowModal(false);
      setNewWeight("");
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
          <p className="text-gray-600">Loading weight data...</p>
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
      {/* Add Weight Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add New Weight
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter weight"
                min="20"
                max="300"
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
                onClick={handleSaveWeight}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Save Weight
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white min-h-screen shadow-xl relative px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-b border-gray-100">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-xl font-bold text-gray-800">Weight History</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your weight journey
            </p>
          </div>
          <div className="flex bg-gray-100 rounded-full p-0.5">
            {["1Y", "3M", "1M"].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-300 ${
                  activePeriod === period
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Current Weight Card */}
        <div className="p-4 bg-[#EB855F] text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Current Weight</h2>
            <div className="text-right">
              <div className="text-xs opacity-80">BMI</div>
              <div className="text-sm font-bold">{bmi.toFixed(1)}</div>
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-3xl font-bold">{currentWeight}</span>
            <span className="text-lg">kg</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div>
              {weightChange !== 0 && (
                <span
                  className={`${
                    weightChange < 0 ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {weightChange < 0 ? "↓" : "↑"}{" "}
                  {Math.abs(weightChange).toFixed(1)} kg last update
                </span>
              )}
            </div>
            <div className="text-xs opacity-80">Goal: {goalWeight} kg</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-4 bg-white">
          <div className="h-64 mb-4">
            {currentData.data.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No weight data available for this period
              </div>
            )}
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Weight Trend</span>
            </div>
          </div>
        </div>

        {/* Progress Analysis */}
        <div className="bg-white p-4 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Progress Analysis
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {Math.abs(weightChange).toFixed(1)} kg
              </div>
              <div className="text-sm text-gray-600">Weekly Change</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {weightToGoal > 0 ? weightToGoal.toFixed(0) : 0} kg
              </div>
              <div className="text-sm text-gray-600">To Goal</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {bmi.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Current BMI</div>
            </div>
          </div>

          {weightData.length > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              Last Updated:{" "}
              {new Date(weightData[0].measurementDate).toLocaleDateString()}
            </div>
          )}

          <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl mb-4">
            <div className="text-sm text-gray-800">Status</div>
            <div className={`text-sm font-semibold ${getProgressColor()}`}>
              {getProgressStatus()}
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Entries</h2>
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {weightData.length > 0 ? (
              weightData.slice(0, 4).map((entry, index) => {
                const date = new Date(entry.measurementDate);
                const change =
                  index < weightData.length - 1
                    ? entry.weight.value - weightData[index + 1].weight.value
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
                        Morning weigh-in
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {entry.weight.value} kg
                      </div>
                      {change !== 0 && (
                        <div
                          className={`text-xs ${
                            change < 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {change < 0 ? "↓" : "↑"} {Math.abs(change).toFixed(1)}{" "}
                          kg
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                No weight entries available
              </div>
            )}
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="bg-white p-4 border-t border-gray-100 mb-16">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Health Tips</h2>

          <div className="bg-green-50 p-4 rounded-xl mb-4">
            <div className="font-bold mb-1 text-gray-800 text-sm">
              For sustainable weight management:
            </div>
            <div className="text-lg font-bold text-green-600">
              Aim for 0.5-1 kg per week
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-bold mb-2 text-gray-800 flex items-center">
                <span className="mr-2 text-orange-500 text-lg">📊</span>
                Calorie Balance
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Create a daily calorie deficit of 500-750 calories through diet
                and exercise to lose 0.5-1 kg per week safely.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-bold mb-2 text-gray-800 flex items-center">
                <span className="mr-2 text-orange-500 text-lg">💪</span>
                Exercise Plan
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Combine cardio (150 min/week) with strength training (2-3x/week)
                for optimal fat loss and muscle preservation.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-bold mb-2 text-gray-800 flex items-center">
                <span className="mr-2 text-orange-500 text-lg">🍎</span>
                Nutrition Focus
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Eat plenty of protein (0.8-1g per kg body weight), include
                fiber-rich foods, and stay hydrated with 8+ glasses of water
                daily.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="font-bold mb-2 text-gray-800 flex items-center">
                <span className="mr-2 text-orange-500 text-lg">⏰</span>
                Consistency is Key
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Weigh yourself at the same time daily (preferably morning) and
                track weekly averages rather than daily fluctuations.
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

        .chart-tooltip {
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default WeightTracker;
