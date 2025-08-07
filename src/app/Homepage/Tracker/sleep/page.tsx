"use client";
import * as React from "react";
import { useState } from "react";
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
import { Target, TrendingUp, Calendar } from "lucide-react";

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

const SleepTracker: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState("Week");

  // Sleep data
  const avgSleep = "7.5h";
  const sleepDebt = "52.5h";
  const hoursPerDay = "8h/day";

  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sleep Hours",
        data: [7.2, 6.8, 7.5, 6.9, 7.8, 8.2, 7.1],
        borderColor: "#8B5CF6",
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
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.05)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
        borderColor: "#8B5CF6",
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number } }) =>
            `${context.parsed.y.toFixed(1)}h sleep`,
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
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: false,
        min: 5,
        max: 9,
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
            return value + "h";
          },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white min-h-screen shadow-xl relative">
        {/* Sleep Schedule */}

        {/* Progress Section */}
        <div className="bg-white border-t border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Progress</h2>

          <div className="flex bg-gray-100 rounded-full p-0.5 mb-6">
            {["Daily", "Weekly", "Monthly", "3 Months", "Yearly"].map(
              (period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-full transition-all duration-300 ${
                    activePeriod === period
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {period}
                </button>
              )
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {avgSleep}
              </div>
              <div className="text-xs text-gray-600">Avg Sleep</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {sleepDebt}
              </div>
              <div className="text-xs text-gray-600">Sleep Debt</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {hoursPerDay}
              </div>
              <div className="text-xs text-gray-600">Goal</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 mb-4">
            <Line data={weeklyData} options={chartOptions} />
          </div>
        </div>

        {/* Sleep Insights */}
        <div className="bg-white p-6 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Sleep Insights
          </h2>

          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Sleep Goal
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    You&apos;re averaging 7.5 hours per night. Try to maintain
                    7-9 hours for optimal health and recovery.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Sleep Quality
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Your sleep rate of 82% indicates good sleep quality. Keep
                    consistent bedtime routines for better results.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Consistency
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Try to go to bed and wake up at the same time every day,
                    even on weekends, to regulate your circadian rhythm.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Tips */}
        <div className="bg-white p-6 border-t border-gray-100 mb-16">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Better Sleep Tips
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Avoid caffeine and large meals 3-4 hours before bedtime</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Keep your bedroom cool, dark, and quiet for optimal sleep
                conditions
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Establish a relaxing pre-sleep routine like reading or
                meditation
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Limit screen time 1 hour before bed to reduce blue light
                exposure
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default SleepTracker;
