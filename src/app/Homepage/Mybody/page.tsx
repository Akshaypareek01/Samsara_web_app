"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Eye,
  Activity,
  Target,
  User,
  Calendar,
} from "lucide-react";

// Base URL utility (you can import this from your utils)
import { BASE_URL } from "@/lib/utils";

// Type definitions
interface ProfileData {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  bodyshape?: string;
  focusarea?: string[];
  goal?: Array<{
    name?: string;
    target?: string;
    progress?: number;
  }>;
}

interface DoshaInfo {
  name: string;
  description: string;
}

export default function ProfileDashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const result = parts.pop()?.split(";").shift();
      return result || null;
    }
    return null;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = getCookie("accessToken");

        if (!accessToken) {
          setError("Access token not found in cookies");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper function to get dosha info
  const getDoshaInfo = (bodyshape?: string): DoshaInfo => {
    const doshaMap: Record<string, DoshaInfo> = {
      Mesomorph: {
        name: "Pitta",
        description: "Athletic and muscular build with balanced energy",
      },
      Ectomorph: {
        name: "Vata",
        description: "Lean and light build with high energy",
      },
      Endomorph: {
        name: "Kapha",
        description: "Solid and stable build with steady energy",
      },
    };
    return (
      doshaMap[bodyshape || ""] || {
        name: "Unknown",
        description: "Body type assessment needed",
      }
    );
  };

  // Helper function to convert height to feet and inches
  const convertHeight = (heightCm?: number): string => {
    if (!heightCm) return "Not set";
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading profile</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const dosha = getDoshaInfo(profileData?.bodyshape);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Box */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">My Body</h1>
            <div className="flex items-center space-x-2 ml-8">
              <span className="text-gray-500 text-sm">Dashboard</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-orange-500 text-sm font-medium">
                Body Status
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch min-h-[600px]">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Key Metrics
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-600 text-sm">Gender</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {profileData?.gender || "Not set"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-600 text-sm">Age</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData?.age ? `${profileData.age} years` : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Body Measurements
                </h2>
                <button className="text-orange-500 text-sm flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View History</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 text-gray-400">📏</span>
                    <span className="text-gray-900 text-sm">Height</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {convertHeight(profileData?.height)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {profileData?.height
                        ? `${profileData.height} cm`
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 text-gray-400">⚖️</span>
                    <span className="text-gray-900 text-sm">Weight</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {profileData?.weight
                        ? `${profileData.weight} kg`
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 text-gray-400">🏋️</span>
                    <span className="text-gray-900 text-sm">Body Type</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {profileData?.bodyshape || "Not assessed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 flex flex-col h-full space-y-6 mb-6">
            {/* Focus Areas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Focus Areas
              </h2>

              {profileData?.focusarea && profileData.focusarea.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.focusarea.map((area, index) => (
                    <div
                      key={index}
                      className="border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {area}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Focused practice area for holistic wellness
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No focus areas set yet</p>
                </div>
              )}
            </div>

            {/* Dosha Profile */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Dosha Profile
              </h2>

              {profileData?.bodyshape ? (
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 flex-shrink-0 rounded-full bg-orange-50 flex items-center justify-center">
                    <span className="text-3xl">🧘</span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {dosha.name} Body Type
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {dosha.description}
                    </p>

                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {profileData.bodyshape}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-3 block">🧘</span>
                  <p>No dosha profile available</p>
                  <p className="text-sm">
                    Complete body assessment to see your dosha
                  </p>
                </div>
              )}
            </div>

            {/* My Goals */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Goals
              </h2>

              {profileData?.goal && profileData.goal.length > 0 ? (
                <div className="space-y-4">
                  {profileData.goal.map((goalItem, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {goalItem.name || `Goal ${index + 1}`}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {goalItem.target || "Target not set"}
                        </span>
                      </div>
                      {goalItem.progress && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(goalItem.progress, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress: {goalItem.progress}%</span>
                            <span>{100 - goalItem.progress}% to go</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No goals set yet</p>
                  <p className="text-sm">
                    Set your fitness and wellness goals to track progress
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
