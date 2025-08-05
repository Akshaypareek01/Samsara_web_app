"use client";

import React, { useState, useEffect } from "react";
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

interface BMIData {
  labels: string[];
  data: number[];
}

interface PeriodData {
  [key: string]: BMIData;
}

const BMITracker: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>("3M");

  const periodData: PeriodData = {
    "1Y": {
      labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
      data: [24.5, 24.2, 23.9, 23.8, 23.7, 23.6],
    },
    "3M": {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [24.2, 24.0, 23.8, 23.9, 23.7, 23.6],
    },
    "1M": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [23.8, 23.7, 23.65, 23.6],
    },
  };

  const currentData = periodData[activePeriod];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: "BMI",
        data: currentData.data,
        borderColor: "#4CAF50",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, "rgba(76, 175, 80, 0.3)");
          gradient.addColorStop(1, "rgba(76, 175, 80, 0.05)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#4CAF50",
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
        borderColor: "#4CAF50",
        borderWidth: 1,
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
      },
      y: {
        beginAtZero: false,
        min: 23,
        max: 25,
        grid: {
          color: "#f0f0f0",
        },
        border: {
          display: false,
        },
        ticks: {
          callback: function (value: any) {
            return value.toFixed(1);
          },
        },
      },
    },
  };

  const handleAddData = () => {
    alert("Add new BMI measurement feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">BMI History</h1>
          <div className="flex bg-gray-100 rounded-full p-0.5">
            {["1Y", "3M", "1M"].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 ${
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

        {/* Chart Section */}
        <div className="p-4 bg-white">
          <div className="h-48 mb-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* BMI Breakdown */}
        <div className="bg-white p-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            BMI Breakdown
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">165</div>
              <div className="text-sm text-gray-600">Current Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">69</div>
              <div className="text-sm text-gray-600">Current Height</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-3">
            Last Updated: May 14, 2025
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <div className="text-sm text-gray-600">
              Change Since Last Measurement
            </div>
            <div className="text-sm font-semibold text-green-600">
              -0.2% BMI
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold mb-2 text-gray-800">
              How BMI is Calculated
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              BMI is calculated as: BMI = weight(kg) / height(m)²
              <br />
              Current BMI: 23.6 (Normal weight category)
            </div>
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="bg-white p-4 border-t border-gray-100 mb-16">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Health Recommendations
          </h2>

          <div className="bg-green-50 p-3 rounded-lg mb-3">
            <div className="font-semibold mb-1 text-gray-800 text-sm">
              For your height (5&apos;9&quot;), a healthy weight range is:
            </div>
            <div className="text-lg font-bold text-green-600">
              125 - 169 lbs
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-semibold mb-1 text-gray-800 flex items-center text-sm">
                <span className="mr-2">🎯</span>
                Maintain Your Healthy Weight
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Great job! You&apos;re in a healthy BMI range. Focus on
                maintaining your current weight through balanced nutrition and
                regular physical activity.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1 text-gray-800 flex items-center text-sm">
                <span className="mr-2">🏃‍♂️</span>
                Exercise Recommendation
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Aim for at least 150 minutes of moderate intensity or 75 minutes
                of vigorous activity each week for optimal health benefits.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1 text-gray-800 flex items-center text-sm">
                <span className="mr-2">🥗</span>
                Nutrition Tips
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Focus on nutrient-dense foods like fruits, vegetables, lean
                proteins, and whole grains. Stay hydrated and watch portion
                sizes for added sugars.
              </div>
            </div>
          </div>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={handleAddData}
          className="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl font-light z-10"
        >
          +
        </button>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default BMITracker;
