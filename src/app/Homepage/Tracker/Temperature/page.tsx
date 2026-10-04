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
import { Thermometer } from "lucide-react";
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

interface TemperatureMeasurement {
  temperature: {
    unit: string;
    value: number;
  };
  status: string;
  isActive: boolean;
  userId: string;
  notes: string;
  measurementDate: string;
  id: string;
}

interface TemperatureData {
  labels: string[];
  data: number[];
}

interface PeriodData {
  [key: string]: TemperatureData;
}

const TemperatureTracker: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>("Today");
  const [showModal, setShowModal] = useState(false);
  const [newTemperature, setNewTemperature] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState("F");
  const [tempData, setTempData] = useState<TemperatureMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Temperature data from API
  useEffect(() => {
    const fetchTempData = async () => {
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
          `${BASE_URL}/trackers/temperature/history`,
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

        const data: TemperatureMeasurement[] = await response.json();
        setTempData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching Temperature data:", err);
        if (err instanceof Error && err.message.includes("Authentication")) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load Temperature data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTempData();
  }, []);

  // Process API data for chart
  const processChartData = (): PeriodData => {
    if (!tempData.length) {
      return {
        Today: { labels: [], data: [] },
        Week: { labels: [], data: [] },
        Month: { labels: [], data: [] },
        Year: { labels: [], data: [] },
      };
    }

    // Sort data by date (newest first)
    const sortedData = [...tempData].sort(
      (a, b) =>
        new Date(b.measurementDate).getTime() -
        new Date(a.measurementDate).getTime()
    );

    // Get the most recent measurements based on period
    const now = new Date();
    let filteredData: TemperatureMeasurement[] = [];

    switch (activePeriod) {
      case "Today":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          const today = new Date();
          return (
            itemDate.getDate() === today.getDate() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear()
          );
        });
        break;
      case "Week":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case "Month":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      case "Year":
        filteredData = sortedData.filter((item) => {
          const itemDate = new Date(item.measurementDate);
          return (
            now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000
          );
        });
        break;
      default:
        filteredData = sortedData.slice(0, 10); // Default to last 10 measurements
    }

    // Take the most recent 6-8 measurements for chart
    const chartData = filteredData.slice(0, 8).reverse();

    const labels = chartData.map((item) => {
      const date = new Date(item.measurementDate);
      if (activePeriod === "Today") {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } else if (activePeriod === "Week") {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    });

    const data = chartData.map((item) => item.temperature.value);

    return {
      [activePeriod]: {
        labels,
        data,
      },
    };
  };

  const periodData = processChartData();
  const currentData = periodData[activePeriod];
  const currentTemp =
    currentData.data.length > 0
      ? currentData.data[currentData.data.length - 1]
      : 98.6;
  const avgTemp =
    currentData.data.length > 0
      ? currentData.data.reduce((a, b) => a + b, 0) / currentData.data.length
      : 98.6;
  const minTemp =
    currentData.data.length > 0 ? Math.min(...currentData.data) : 98.6;
  const maxTemp =
    currentData.data.length > 0 ? Math.max(...currentData.data) : 98.6;

  const getTemperatureStatus = (temp: number) => {
    if (temp < 97.0)
      return { status: "Low", color: "text-blue-600", bg: "bg-blue-50" };
    if (temp >= 97.0 && temp <= 99.0)
      return { status: "Normal", color: "text-green-600", bg: "bg-green-50" };
    if (temp > 99.0 && temp <= 100.4)
      return {
        status: "Slight Fever",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return { status: "Fever", color: "text-red-600", bg: "bg-red-50" };
  };

  const tempStatus = getTemperatureStatus(currentTemp);

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: `Temperature (°${unit})`,
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
            `${context.parsed.y.toFixed(1)}°${unit}`,
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
          currentData.data.length > 0
            ? Math.min(...currentData.data) - 0.5
            : 95,
        max:
          currentData.data.length > 0
            ? Math.max(...currentData.data) + 0.5
            : 105,
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
            return Number(value).toFixed(1) + "°" + unit;
          },
        },
      },
    },
  };

  const handleSaveTemperature = () => {
    if (newTemperature && date && time) {
      alert(
        `New temperature saved!\nTemperature: ${newTemperature}°${unit}\nDate: ${date}\nTime: ${time}`
      );
      setShowModal(false);
      setNewTemperature("");
      setDate("");
      setTime("");
    }
  };

  // Auto-set date and time
  useEffect(() => {
    if (showModal) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);
      setDate(today);
      setTime(currentTime);
    }
  }, [showModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Temperature data...</p>
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
      {/* Add Temperature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center mb-4">
              <Thermometer className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                Add Temperature
              </h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newTemperature}
                  onChange={(e) => setNewTemperature(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="98.6"
                  min="95"
                  max="110"
                  step="0.1"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
                onClick={handleSaveTemperature}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Save Reading
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white min-h-screen shadow-xl relative px-4">
        {/* Current Temperature Card */}
        <div className="p-6 bg-[#EB855F] text-white relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">
                Current Temperature
              </h1>
              <p className="text-sm opacity-90">
                {tempData.length > 0
                  ? `Last updated: ${new Date(
                      tempData[0].measurementDate
                    ).toLocaleDateString()}${
                      new Date(tempData[0].measurementDate).getUTCHours() ===
                        0 &&
                      new Date(tempData[0].measurementDate).getUTCMinutes() ===
                        0
                        ? ""
                        : ` - ${new Date(
                            tempData[0].measurementDate
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}`
                    }`
                  : "No recent readings"}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Thermometer className="h-6 w-6" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-4xl font-bold">{currentTemp.toFixed(1)}</span>
            <span className="text-lg">
              °{tempData.length > 0 ? tempData[0].temperature.unit : "F"}
            </span>
          </div>

          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${tempStatus.bg} ${tempStatus.color} bg-opacity-90`}
          >
            {tempData.length > 0 ? tempData[0].status : tempStatus.status}
          </div>
        </div>

        {/* History Section */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-gray-800">History</h2>

          <div className="flex bg-gray-100 rounded-full p-0.5 mb-6">
            {["Today", "Week", "Month", "Year"].map((period) => (
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

          <div className="h-64 mb-6">
            {currentData.data.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No Temperature data available for this period
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-6 mb-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                High: {maxTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Normal: {avgTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Low: {minTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white p-4 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Analysis</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {avgTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </div>
              <div className="text-xs text-gray-600">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {maxTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </div>
              <div className="text-xs text-gray-600">Highest</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {minTemp.toFixed(1)}°
                {tempData.length > 0 ? tempData[0].temperature.unit : "F"}
              </div>
              <div className="text-xs text-gray-600">Lowest</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-800">
                Normal Range
              </span>
              <span className="ml-auto text-sm text-blue-600 font-medium">
                Range
              </span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Your temperature readings remain within healthy ranges.
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl mb-4">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-800">Trend</span>
              <span className="ml-auto text-sm text-orange-600 font-medium">
                Stable
              </span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              Your temperature remains stable throughout the day.
            </div>
          </div>
        </div>

        {/* Recent Readings */}
        <div className="bg-white p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Readings</h2>
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {tempData.length > 0 ? (
              tempData.slice(0, 4).map((reading) => {
                const date = new Date(reading.measurementDate);
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const isYesterday =
                  new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() ===
                  date.toDateString();

                return (
                  <div
                    key={reading.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {isToday
                          ? "Today"
                          : isYesterday
                          ? "Yesterday"
                          : date.toLocaleDateString()}
                      </div>
                      {date.getUTCHours() === 0 &&
                      date.getUTCMinutes() === 0 &&
                      date.getUTCSeconds() === 0 ? null : (
                        <div className="text-xs text-gray-500">
                          {date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {reading.temperature.value}°{reading.temperature.unit}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          getTemperatureStatus(reading.temperature.value).bg
                        } ${
                          getTemperatureStatus(reading.temperature.value).color
                        }`}
                      >
                        {reading.status}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                No recent readings available
              </div>
            )}
          </div>
        </div>

        {/* Normal Temperature Range */}
        <div className="bg-white p-4 border-t border-gray-100 mb-16">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Normal Temperature Range
          </h2>

          {/* Temperature Range Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>95.0°F</span>
              <span>98.6°F</span>
              <span>100.4°F</span>
            </div>
            <div className="h-4 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full relative">
              <div
                className="absolute top-0 w-3 h-4 bg-white border-2 border-orange-500 rounded-full transform -translate-x-1/2"
                style={{
                  left: `${((currentTemp - 95) / (100.4 - 95)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="text-sm text-gray-600 leading-relaxed mb-4">
            Normal body temperature typically ranges from 97.0°F to 99.0°F
            (36.1°C to 37.2°C). Temperature variations can occur throughout the
            day and may be influenced by activity, food, sleep, and
            environmental factors. Readings above 100.4°F may indicate fever.
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-800">
                Low Temperature
              </span>
              <span className="text-sm text-blue-600 font-bold">
                &lt; 97.0°F
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-800">
                Normal Temperature
              </span>
              <span className="text-sm text-green-600 font-bold">
                97.0°F - 99.0°F
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-800">
                Slight Fever
              </span>
              <span className="text-sm text-yellow-600 font-bold">
                99.1°F - 100.4°F
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-800">Fever</span>
              <span className="text-sm text-red-600 font-bold">
                &gt; 100.4°F
              </span>
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

export default TemperatureTracker;
