"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MessageCircle,
  Pencil,
  Upload,
  Edit2,
  Eye,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

type Qualification = {
  title: string;
  subtitle: string;
  year: string;
};

type UserImage = {
  _id: string;
  filename: string;
  path: string;
  key: string;
};

type UserProfile = {
  role: string;
  expertise: string[];
  qualification: Qualification[];
  additional_courses: string[];
  focusarea: string[];
  goal: string[];
  health_issues: string[];
  achievements: string[];
  assessments: string[];
  status: boolean;
  active: boolean;
  profileImage: string;
  AboutMe: string;
  notificationToken: string;
  favoriteClasses: string[];
  favoriteEvents: string[];
  favoriteTeachers: string[];
  email: string;
  name: string;
  teacherCategory: string;
  attendance: string[];
  classFeedback: string[];
  images: UserImage[];
  id: string;
};

export default function InstructorProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form states
  const [aboutText, setAboutText] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [credentials, setCredentials] = useState<Qualification[]>([]);
  const [newCredential, setNewCredential] = useState<Qualification>({
    title: "",
    subtitle: "",
    year: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch profile data function
  const fetchProfileData = async (userId: string) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return null;
    }

    try {
      const profileRes = await fetch(`${BASE_URL}/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileRes.ok) {
        console.error(`Failed to fetch profile: ${profileRes.status}`);
        toast.error("Failed to fetch profile data");
        return null;
      }

      const profileData = await profileRes.json();
      if (profileData.status === "success" && profileData.data.user) {
        return profileData.data.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Network error while fetching profile");
      return null;
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("accessToken");
      if (!token) {
        toast.error("Please login to view your profile");
        setLoading(false);
        return;
      }

      try {
        // First get current user to get their ID
        const currentUserRes = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!currentUserRes.ok) {
          toast.error("Failed to fetch user data");
          setLoading(false);
          return;
        }

        const currentUserData = await currentUserRes.json();
        const userId = currentUserData.id;
        setCurrentUserId(userId);

        // Then fetch detailed profile using the ID
        const profileData = await fetchProfileData(userId);
        if (profileData) {
          setProfile(profileData);
          toast.success("Profile loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Initialize form states when modal opens
  useEffect(() => {
    if (profile) {
      if (activeModal === "about") {
        setAboutText(profile.AboutMe || "");
      } else if (activeModal === "specialties") {
        setSpecialties([...profile.expertise]);
      } else if (activeModal === "credentials") {
        setCredentials([...profile.qualification]);
      }
    }
  }, [activeModal, profile]);

  // Updated API update function with react-hot-toast
  const updateProfile = async (updateData: Partial<UserProfile>) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return false;
    }

    setUpdating(true);

    // Show loading toast
    const loadingToast = toast.loading("Updating profile...");

    try {
      console.log("Sending update:", updateData);

      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("Response status:", response.status);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Check if response is successful (200-299 range)
      if (response.ok) {
        try {
          const result = await response.json();
          console.log("Update result:", result);

          // If we have a successful response, update the local state
          setProfile((prev) => (prev ? { ...prev, ...updateData } : null));

          // Optionally fetch fresh profile data
          if (currentUserId) {
            const freshProfile = await fetchProfileData(currentUserId);
            if (freshProfile) {
              setProfile(freshProfile);
            }
          }

          toast.success("Profile updated successfully!");
          return true;
        } catch {
          // If JSON parsing fails but response was ok, still consider it success
          console.log("JSON parsing failed but response was successful");
          setProfile((prev) => (prev ? { ...prev, ...updateData } : null));
          toast.success("Profile updated successfully!");
          return true;
        }
      } else {
        // Handle error responses
        try {
          const errorResult = await response.json();
          console.error("Update failed:", errorResult);
          toast.error(
            errorResult.message ||
              `Failed to update profile. Status: ${response.status}`
          );
        } catch {
          // If we can't parse error response, show generic message
          toast.error(`Failed to update profile. Status: ${response.status}`);
        }
        return false;
      }
    } catch (error) {
      // Dismiss loading toast if still active
      toast.dismiss(loadingToast);
      console.error("Network error during update:", error);
      toast.error(
        "Network error occurred. Please check your connection and try again."
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewSpecialty("");
    setNewCredential({ title: "", subtitle: "", year: "" });
  };

  const handleSaveAbout = async () => {
    if (!aboutText.trim()) {
      toast.error("About section cannot be empty");
      return;
    }

    const success = await updateProfile({
      AboutMe: aboutText,
    });

    if (success) {
      closeModal();
    }
  };

  const handleSaveSpecialties = async () => {
    if (specialties.length === 0) {
      toast.error("Please add at least one specialty");
      return;
    }

    const success = await updateProfile({
      expertise: specialties,
    });

    if (success) {
      closeModal();
    }
  };

  const handleSaveCredentials = async () => {
    if (credentials.length === 0) {
      toast.error("Please add at least one credential");
      return;
    }

    // Transform credentials to match the expected format
    const formattedCredentials = credentials.map((cred) => ({
      title: cred.title,
      subtitle: cred.subtitle,
      year: cred.year,
    }));

    const success = await updateProfile({
      qualification: formattedCredentials,
    });

    if (success) {
      closeModal();
    }
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) {
      toast.error("Please enter a specialty");
      return;
    }

    if (specialties.includes(newSpecialty.trim())) {
      toast.error("This specialty already exists");
      return;
    }

    setSpecialties([...specialties, newSpecialty.trim()]);
    setNewSpecialty("");
    toast.success("Specialty added!");
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
    toast.success("Specialty removed!");
  };

  const addCredential = () => {
    if (!newCredential.title.trim()) {
      toast.error("Please enter credential title");
      return;
    }
    if (!newCredential.subtitle.trim()) {
      toast.error("Please enter institution/organization");
      return;
    }
    if (!newCredential.year.trim()) {
      toast.error("Please enter completion year");
      return;
    }

    setCredentials([...credentials, { ...newCredential }]);
    setNewCredential({ title: "", subtitle: "", year: "" });
    toast.success("Credential added!");
  };

  const removeCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
    toast.success("Credential removed!");
  };

  // Handler for uploading image (real backend integration)
  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }
    if (!currentUserId) {
      toast.error("User not found. Please reload the page.");
      return;
    }
    setUploading(true);
    const loadingToast = toast.loading("Uploading image...");
    try {
      // 1. Upload file to /upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        toast.dismiss(loadingToast);
        toast.error("Failed to upload image");
        setUploading(false);
        return;
      }
      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.url || !uploadData.fileName) {
        toast.dismiss(loadingToast);
        toast.error("Invalid upload response");
        setUploading(false);
        return;
      }
      // 2. Save image to user gallery
      const token = Cookies.get("accessToken");
      const imageRes = await fetch(
        `${BASE_URL}/users/${currentUserId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: uploadData.fileName,
            path: uploadData.url,
            key: uploadData.fileName,
          }),
        }
      );
      if (!imageRes.ok) {
        toast.dismiss(loadingToast);
        toast.error("Failed to save image to gallery");
        setUploading(false);
        return;
      }
      // 3. Refresh profile/gallery
      if (currentUserId) {
        const freshProfile = await fetchProfileData(currentUserId);
        if (freshProfile) {
          setProfile(freshProfile);
        }
      }
      toast.dismiss(loadingToast);
      toast.success("Image uploaded successfully!");
      setSelectedFile(null);
      closeModal();
    } catch {
      toast.dismiss();
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">
            Profile not found
          </h2>
          <p className="text-gray-500 mt-2">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
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
          loading: {
            iconTheme: {
              primary: "#F59E0B",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="flex justify-center py-10 px-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-md w-full max-w-6xl pb-10">
          {/* Cover Image */}
          <div className="relative w-full h-[200px] mx-auto rounded-t-2xl overflow-hidden">
            <Image
              src="/images/plot.svg"
              alt="Studio Cover"
              layout="fill"
              objectFit="cover"
              className="object-cover"
            />
          </div>

          {/* Profile Avatar */}
          <div className="relative flex justify-start px-12">
            <div className="relative -mt-12 w-[80px] h-[80px] rounded-full overflow-hidden ring-4 ring-white shadow-md">
              <Image
                src={profile.profileImage || "/images/logo.svg"}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Name and Rating */}
          <div className="mt-3 pl-12">
            <h2 className="text-lg font-semibold">{profile.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {profile.teacherCategory}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 stroke-yellow-400"
                  />
                ))}
              </div>
              <span className="font-semibold text-black ml-1">5.0</span>
              <span className="text-gray-500">(87 reviews)</span>
            </div>
          </div>

          {/* Stats + Buttons */}
          <div className="mt-6 px-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-center w-[130px]">
                <h3 className="text-orange-500 font-semibold text-md">
                  1,240+
                </h3>
                <p className="text-xs text-gray-500">Classes</p>
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-center w-[130px]">
                <h3 className="text-orange-500 font-semibold text-md">8+</h3>
                <p className="text-xs text-gray-500">Years Experience</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                className="flex items-center justify-center gap-1 bg-[#EB855F] hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm w-52"
                onClick={() => toast.success("Chat feature coming soon!")}
              >
                <MessageCircle className="w-4 h-4" /> Chat
              </button>
              <button
                className="bg-[#EB855F] hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm w-52 text-center"
                onClick={() => toast.success("Join feature coming soon!")}
              >
                Join Now
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8" />

          {/* Main Grid */}
          <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* About */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-black">About</h3>
                  <Pencil
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => openModal("about")}
                  />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.AboutMe ||
                    "No description available yet. This instructor hasn't added their bio."}
                </p>
              </div>

              {/* Teaching Credentials */}
              <div className="bg-white p-6 pb-8 rounded-xl shadow-sm min-h-[390px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-black">
                    Teaching Credentials
                  </h3>
                  <button
                    className="text-orange-500 text-sm font-medium hover:underline"
                    onClick={() => openModal("credentials")}
                  >
                    + Add New
                  </button>
                </div>

                <div className="space-y-6">
                  {profile.qualification && profile.qualification.length > 0 ? (
                    profile.qualification.map((item, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                            {item.title}
                            <span className="bg-green-100 text-green-600 text-[10px] font-medium px-2 py-[2px] rounded-full">
                              Verified
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.subtitle}
                          </p>
                          <p className="text-sm text-gray-400">
                            Completed: {item.year}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Eye
                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                            onClick={() => toast("View feature coming soon!")}
                          />
                          <Edit2
                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
                            onClick={() => openModal("credentials")}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No credentials added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Specialties */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-black">
                    Specialties
                  </h3>
                  <Pencil
                    className="w-4 h-4 text-orange-500 cursor-pointer hover:text-orange-600 transition-colors"
                    onClick={() => openModal("specialties")}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise && profile.expertise.length > 0 ? (
                    profile.expertise.map((item, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-600 px-3 py-1 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No specialties added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-black">Gallery</h3>
                  <button
                    className="flex items-center gap-1 text-orange-500 text-sm hover:underline"
                    onClick={() => openModal("gallery-upload")}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>

                {/* Grid with no white space */}
                <div className="grid grid-cols-2 gap-[4px]">
                  {profile.images && profile.images.length > 0 ? (
                    // Show only user's actual images
                    profile.images.map((image, i) => (
                      <div
                        key={i}
                        className="relative w-full h-[100px] sm:h-[120px] md:h-[140px] rounded-md overflow-hidden"
                      >
                        <Image
                          src={image.path}
                          alt={`Gallery ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    // Show message if no images
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <p className="text-sm">No images uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 ml-3 mr-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-black">Testimonials</h3>
              <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <span className="text-yellow-500">★★★★★</span>
                <span>4.7</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Michael Cooper",
                  image: "/images/user1.svg",
                  date: "May 15",
                  text: "Emily is an exceptional instructor. Her attention to detail and personalized adjustments helped me achieve poses I never thought possible.",
                },
                {
                  name: "Sarah Johnson",
                  image: "/images/user1.svg",
                  date: "May 10",
                  text: "Great class overall! The pace was challenging but manageable. The studio space is beautiful and the energy was perfect.",
                },
                {
                  name: "Sarah Johnson",
                  image: "/images/user1.svg",
                  date: "May 10",
                  text: "Great class overall! The pace was challenging but manageable. The studio space is beautiful and the energy was perfect.",
                },
                {
                  name: "Jessica Williams",
                  image: "/images/user1.svg",
                  date: "May 10",
                  text: "I've been to many yoga classes. Emily's advanced flow is truly special. Her sequencing is thoughtful and challenging.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                      <div className="text-sm font-semibold text-black">
                        {item.name}
                        <div className="text-xs text-yellow-500">★★★★★</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* About Modal */}
            {activeModal === "about" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    Edit About
                  </h3>
                  <X
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={closeModal}
                  />
                </div>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Tell students about yourself..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={updating}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAbout}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* Specialties Modal */}
            {activeModal === "specialties" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    Edit Specialties
                  </h3>
                  <X
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={closeModal}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add new specialty..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                      disabled={updating}
                    />
                    <button
                      onClick={addSpecialty}
                      className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      disabled={updating}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 text-sm rounded-full"
                      >
                        <span>{specialty}</span>
                        <Trash2
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeSpecialty(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSpecialties}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* Credentials Modal */}
            {activeModal === "credentials" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    Edit Credentials
                  </h3>
                  <X
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={closeModal}
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Add New Credential
                  </h4>
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={newCredential.title}
                      onChange={(e) =>
                        setNewCredential({
                          ...newCredential,
                          title: e.target.value,
                        })
                      }
                      placeholder="Certification Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={updating}
                    />
                    <input
                      type="text"
                      value={newCredential.subtitle}
                      onChange={(e) =>
                        setNewCredential({
                          ...newCredential,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Institution/Organization"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={updating}
                    />
                    <input
                      type="text"
                      value={newCredential.year}
                      onChange={(e) =>
                        setNewCredential({
                          ...newCredential,
                          year: e.target.value,
                        })
                      }
                      placeholder="Year Completed"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={updating}
                    />
                    <button
                      onClick={addCredential}
                      className="w-full px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={updating}
                    >
                      <Plus className="w-4 h-4" />
                      Add Credential
                    </button>
                  </div>

                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-700">
                      Current Credentials
                    </h4>
                    {credentials.map((credential, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {credential.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {credential.subtitle}
                            </div>
                            <div className="text-sm text-gray-400">
                              Completed: {credential.year}
                            </div>
                          </div>
                          <Trash2
                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 ml-2"
                            onClick={() => removeCredential(index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCredentials}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
            {/* Gallery Upload Modal */}
            {activeModal === "gallery-upload" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    Upload Image
                  </h3>
                  <X
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={closeModal}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-700">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImageUpload}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
