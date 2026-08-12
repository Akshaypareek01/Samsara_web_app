"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Edit,
  Camera,
  Heart,
  Target,
  Award,
  BookOpen,
  Users,
  Star,
  Activity,
  TrendingUp,
  CheckCircle,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { getCookie } from "cookies-next";
import { BASE_URL } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import LetterAvatar from "@/components/LetterAvatar";

interface UserImage {
  _id: string;
  filename: string;
  path: string;
  key: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  AboutMe?: string;
  description?: string;
  notificationToken?: string;
  favoriteClasses?: string[];
  favoriteEvents?: string[];
  favoriteTeachers?: string[];
  userCategory?: string;
  attendance?: string[];
  classFeedback?: string[];
  images?: UserImage[];
  age?: string;
  bodyshape?: string;
  gender?: string;
  height?: string;
  weight?: string;
  mobile?: string;
  dob?: string;
  Address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  targetWeight?: string;
  weeklyyogaplan?: string;
  practicetime?: string;
  howyouknowus?: string;
  PriorExperience?: string;
  teacherCategory?: string;
  teachingExperience?: string;
  company_name?: string;
  companyId?: string;
  corporate_id?: string;
  expertise?: string[];
  qualification?: Array<{
    title: string;
    subtitle: string;
    year: string;
    degree?: string;
    institution?: string;
  }>;
  additional_courses?: Array<{
    course?: string;
    institution?: string;
    year?: string;
  }>;
  focusarea?: string[];
  goal?: string[];
  health_issues?: string[];
  achievements?: string[];
  assessments?: Array<{
    id: string;
    name: string;
    score?: number;
    date?: string;
  }>;
  status?: boolean;
  active?: boolean;
}

export default function UserProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [newTag, setNewTag] = useState({
    focusarea: "",
    goal: "",
    health_issues: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken) {
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserProfile(data);
        toast.success("Profile loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize edit form data when modal opens
  useEffect(() => {
    if (isEditModalOpen && userProfile) {
      setEditFormData({ ...userProfile });
      setProfileImagePreview(null);
      setProfileImageFile(null);
      setNewTag({ focusarea: "", goal: "", health_issues: "" });
    }
  }, [isEditModalOpen, userProfile]);

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof newTag
  ) => {
    setNewTag((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddTag = (field: "focusarea" | "goal" | "health_issues") => {
    if (!newTag[field]?.trim()) return;

    setEditFormData((prev) => {
      const currentTags = Array.isArray(prev[field])
        ? [...(prev[field] as string[])]
        : [];
      return {
        ...prev,
        [field]: [...currentTags, newTag[field]],
      };
    });

    setNewTag((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRemoveTag = (
    field: "focusarea" | "goal" | "health_issues",
    index: number
  ) => {
    setEditFormData((prev) => {
      const currentTags = Array.isArray(prev[field])
        ? [...(prev[field] as string[])]
        : [];
      currentTags.splice(index, 1);
      return { ...prev, [field]: currentTags };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setEditFormData((prev) => ({ ...prev, profileImage: undefined }));
  };

  const handleSubmitEdit = async () => {
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        toast.error("Please login to update your profile");
        return;
      }

      let imageUrl = null;

      // First, upload image if exists
      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", profileImageFile);

        const uploadResponse = await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // Prepare profile update data - only include fields that have values
      const profileUpdateData: Partial<UserProfile> = {};

      // Only add fields that have actual values (not empty strings)
      if (editFormData.name && editFormData.name.trim()) {
        profileUpdateData.name = editFormData.name;
      }
      if (editFormData.mobile && editFormData.mobile.trim()) {
        profileUpdateData.mobile = editFormData.mobile;
      }
      if (editFormData.gender && editFormData.gender.trim()) {
        profileUpdateData.gender = editFormData.gender;
      }
      if (editFormData.dob && editFormData.dob.trim()) {
        profileUpdateData.dob = editFormData.dob;
      }
      if (editFormData.age && editFormData.age.trim()) {
        profileUpdateData.age = editFormData.age;
      }
      if (editFormData.Address && editFormData.Address.trim()) {
        profileUpdateData.Address = editFormData.Address;
      }
      if (editFormData.city && editFormData.city.trim()) {
        profileUpdateData.city = editFormData.city;
      }
      if (editFormData.pincode && editFormData.pincode.trim()) {
        profileUpdateData.pincode = editFormData.pincode;
      }
      if (editFormData.country && editFormData.country.trim()) {
        profileUpdateData.country = editFormData.country;
      }
      if (editFormData.height && editFormData.height.trim()) {
        profileUpdateData.height = editFormData.height;
      }
      if (editFormData.weight && editFormData.weight.trim()) {
        profileUpdateData.weight = editFormData.weight;
      }
      if (editFormData.targetWeight && editFormData.targetWeight.trim()) {
        profileUpdateData.targetWeight = editFormData.targetWeight;
      }
      if (editFormData.bodyshape && editFormData.bodyshape.trim()) {
        profileUpdateData.bodyshape = editFormData.bodyshape;
      }
      if (editFormData.weeklyyogaplan && editFormData.weeklyyogaplan.trim()) {
        profileUpdateData.weeklyyogaplan = editFormData.weeklyyogaplan;
      }
      if (editFormData.practicetime && editFormData.practicetime.trim()) {
        profileUpdateData.practicetime = editFormData.practicetime;
      }
      if (editFormData.focusarea && editFormData.focusarea.length > 0) {
        profileUpdateData.focusarea = editFormData.focusarea;
      }
      if (editFormData.goal && editFormData.goal.length > 0) {
        profileUpdateData.goal = editFormData.goal;
      }
      if (editFormData.health_issues && editFormData.health_issues.length > 0) {
        profileUpdateData.health_issues = editFormData.health_issues;
      }
      if (editFormData.howyouknowus && editFormData.howyouknowus.trim()) {
        profileUpdateData.howyouknowus = editFormData.howyouknowus;
      }
      if (editFormData.PriorExperience && editFormData.PriorExperience.trim()) {
        profileUpdateData.PriorExperience = editFormData.PriorExperience;
      }
      if (editFormData.AboutMe && editFormData.AboutMe.trim()) {
        profileUpdateData.description = editFormData.AboutMe;
      }
      if (editFormData.achievements && editFormData.achievements.length > 0) {
        profileUpdateData.achievements = editFormData.achievements;
      }
      if (editFormData.userCategory && editFormData.userCategory.trim()) {
        profileUpdateData.userCategory = editFormData.userCategory;
      }
      if (editFormData.teacherCategory && editFormData.teacherCategory.trim()) {
        profileUpdateData.teacherCategory = editFormData.teacherCategory;
      }
      if (
        editFormData.teachingExperience &&
        editFormData.teachingExperience.trim()
      ) {
        profileUpdateData.teachingExperience = editFormData.teachingExperience;
      }
      if (editFormData.expertise && editFormData.expertise.length > 0) {
        profileUpdateData.expertise = editFormData.expertise;
      }
      if (editFormData.qualification && editFormData.qualification.length > 0) {
        profileUpdateData.qualification = editFormData.qualification;
      }
      if (
        editFormData.additional_courses &&
        editFormData.additional_courses.length > 0
      ) {
        profileUpdateData.additional_courses = editFormData.additional_courses;
      }
      if (editFormData.company_name && editFormData.company_name.trim()) {
        profileUpdateData.company_name = editFormData.company_name;
      }
      if (editFormData.companyId && editFormData.companyId.trim()) {
        profileUpdateData.companyId = editFormData.companyId;
      }
      if (editFormData.corporate_id && editFormData.corporate_id.trim()) {
        profileUpdateData.corporate_id = editFormData.corporate_id;
      }

      // Update profile
      const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdateData),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await profileResponse.json();

      // If image was uploaded, update profile image separately
      if (imageUrl) {
        const imageUpdateResponse = await fetch(
          `${BASE_URL}/users/profile/image`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileImage: imageUrl,
            }),
          }
        );

        if (!imageUpdateResponse.ok) {
          console.warn("Failed to update profile image");
        } else {
          const imageUpdateResult = await imageUpdateResponse.json();
          updatedProfile.profileImage =
            imageUpdateResult.profileImage || imageUrl;
        }
      }

      setUserProfile(updatedProfile);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  const getLatestProfileImage = () => {
    return userProfile.profileImage || undefined;
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="min-h-[60vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 bg-[#ed662e] hover:bg-[#c95520] text-white px-3.5 py-2 rounded-lg text-sm font-medium min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
              >
                <Edit size={16} aria-hidden />
                Edit profile
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-orange-100/80 shadow-sm p-4">
                {/* Profile Image */}
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div className="inline-flex rounded-full overflow-hidden border-4 border-[#ffe0d0]">
                      <LetterAvatar
                        name={userProfile.name}
                        src={getLatestProfileImage()}
                        size={96}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="Change profile photo"
                      className="absolute bottom-0 right-0 bg-[#ed662e] hover:bg-[#c95520] text-white p-2 rounded-full shadow-lg min-h-[36px] min-w-[36px]"
                    >
                      <Camera size={14} aria-hidden />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mt-3">
                    {userProfile.name}
                  </h2>
                  <p className="text-sm text-gray-500">{userProfile.email}</p>
                  <div className="mt-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {userProfile.userCategory || "Personal"}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Role</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {userProfile.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  {userProfile.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" aria-hidden />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Age</p>
                        <p className="text-sm text-gray-600">
                          {userProfile.age} years
                        </p>
                      </div>
                    </div>
                  )}

                  {userProfile.gender && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Gender
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {userProfile.gender}
                        </p>
                      </div>
                    </div>
                  )}

                  {userProfile.bodyshape && (
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Body Type
                        </p>
                        <p className="text-sm text-gray-600">
                          {userProfile.bodyshape}
                        </p>
                      </div>
                    </div>
                  )}

                  {(userProfile.height || userProfile.weight) && (
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Physical Stats
                        </p>
                        <p className="text-sm text-gray-600">
                          {userProfile.height && `${userProfile.height}cm`}
                          {userProfile.height && userProfile.weight && " • "}
                          {userProfile.weight && `${userProfile.weight}kg`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mt-6 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          userProfile.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span
                        className={`text-sm ${
                          userProfile.active
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {userProfile.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs and Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-orange-100/80 shadow-sm">
                {/* Tab Navigation */}
                <div className="">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: "overview", label: "Overview", icon: User },
                      { id: "focus", label: "Focus Areas", icon: Target },
                      {
                        id: "achievements",
                        label: "Achievements",
                        icon: Award,
                      },
                      { id: "favorites", label: "Favorites", icon: Heart },
                      { id: "activity", label: "Activity", icon: Activity },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          About Me
                        </h3>
                        <p className="text-gray-600">
                          {userProfile.AboutMe || "No description available."}
                        </p>
                      </div>

                      {userProfile.focusarea &&
                        userProfile.focusarea.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {userProfile.focusarea.map((area, index) => (
                                <span
                                  key={index}
                                  className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {userProfile.goal && userProfile.goal.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Goals
                          </h3>
                          <div className="space-y-2">
                            {userProfile.goal.map((goal, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Target className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-600">{goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.health_issues &&
                        userProfile.health_issues.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Health Considerations
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {userProfile.health_issues.map((issue, index) => (
                                <span
                                  key={index}
                                  className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {activeTab === "focus" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Focus Areas
                      </h3>
                      {userProfile.focusarea &&
                      userProfile.focusarea.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userProfile.focusarea.map((area, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-orange-500" />
                                <span className="font-medium text-gray-900">
                                  {area}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No focus areas defined yet.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "achievements" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Achievements
                      </h3>
                      {userProfile.achievements &&
                      userProfile.achievements.length > 0 ? (
                        <div className="space-y-4">
                          {userProfile.achievements.map(
                            (achievement, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg"
                              >
                                <Award className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-900">
                                  {achievement}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No achievements yet. Keep practicing!
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "favorites" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Classes
                        </h3>
                        {userProfile.favoriteClasses &&
                        userProfile.favoriteClasses.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteClasses.map(
                              (classItem, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    <span className="font-medium text-gray-900">
                                      {classItem}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite classes yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Events
                        </h3>
                        {userProfile.favoriteEvents &&
                        userProfile.favoriteEvents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteEvents.map((event, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-green-500" />
                                  <span className="font-medium text-gray-900">
                                    {event}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite events yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Favorite Teachers
                        </h3>
                        {userProfile.favoriteTeachers &&
                        userProfile.favoriteTeachers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.favoriteTeachers.map(
                              (teacher, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    <span className="font-medium text-gray-900">
                                      {teacher}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No favorite teachers yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Attendance
                        </h3>
                        {userProfile.attendance &&
                        userProfile.attendance.length > 0 ? (
                          <div className="space-y-2">
                            {userProfile.attendance.map((session, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-900">{session}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No attendance records yet.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Class Feedback
                        </h3>
                        {userProfile.classFeedback &&
                        userProfile.classFeedback.length > 0 ? (
                          <div className="space-y-2">
                            {userProfile.classFeedback.map(
                              (feedback, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                                >
                                  <Star className="w-5 h-5 text-blue-500" />
                                  <span className="text-gray-900">
                                    {feedback}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No feedback submitted yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal — solid backdrop (matches Modal.tsx) */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit Profile"
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit profile
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              <div className="space-y-5">
                {/* Profile Image Section */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="inline-flex rounded-full overflow-hidden border-4 border-[#ffe0d0] mx-auto">
                      {profileImagePreview || editFormData.profileImage ? (
                        <Image
                          src={
                            (profileImagePreview ||
                              editFormData.profileImage) as string
                          }
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover"
                        />
                      ) : (
                        <LetterAvatar
                          name={editFormData.name || userProfile.name}
                          size={128}
                        />
                      )}
                    </div>
                    <div className="flex justify-center mt-4 gap-2">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                      >
                        <Camera size={14} aria-hidden />
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm"
                      >
                        <Trash2 size={14} aria-hidden />
                        Remove
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Basic Info Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ""}
                        onChange={handleEditInputChange}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={editFormData.age || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={editFormData.gender || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Type
                      </label>
                      <input
                        type="text"
                        name="bodyshape"
                        value={editFormData.bodyshape || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={editFormData.height || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={editFormData.weight || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher Category
                      </label>
                      <select
                        name="teacherCategory"
                        value={editFormData.teacherCategory || ""}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Teacher Category</option>
                        <option value="Fitness Coach">Fitness Coach</option>
                        <option value="Ayurveda Specialist">
                          Ayurveda Specialist
                        </option>
                        <option value="Mental Health Specialist">
                          Mental Health Specialist
                        </option>
                        <option value="Yoga Trainer">Yoga Trainer</option>
                        <option value="General Trainer">General Trainer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* About Me Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    About Me
                  </h3>
                  <textarea
                    name="AboutMe"
                    value={editFormData.AboutMe || ""}
                    onChange={handleEditInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                {/* Focus Areas Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editFormData.focusarea || []).map((area, index) => (
                      <div
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag("focusarea", index)}
                          className="ml-2 text-orange-800 hover:text-orange-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag.focusarea}
                      onChange={(e) => handleTagInputChange(e, "focusarea")}
                      placeholder="Add focus area"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag("focusarea")}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md flex items-center"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Goals Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Goals
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editFormData.goal || []).map((goal, index) => (
                      <div
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
                      >
                        {goal}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag("goal", index)}
                          className="ml-2 text-green-800 hover:text-green-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag.goal}
                      onChange={(e) => handleTagInputChange(e, "goal")}
                      placeholder="Add a goal"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag("goal")}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md flex items-center"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Health Considerations Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Health Considerations
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editFormData.health_issues || []).map((issue, index) => (
                      <div
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center"
                      >
                        {issue}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTag("health_issues", index)
                          }
                          className="ml-2 text-red-800 hover:text-red-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag.health_issues}
                      onChange={(e) => handleTagInputChange(e, "health_issues")}
                      placeholder="Add health consideration"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag("health_issues")}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md flex items-center"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitEdit}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
