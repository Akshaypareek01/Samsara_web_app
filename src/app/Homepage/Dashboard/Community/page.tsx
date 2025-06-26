import React from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Community</h1>

            {/* First Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="Olivia Martinez"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      Olivia Martinez
                    </h3>
                    <span className="text-xs text-gray-500">1hr ago</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    Completed my 30-day meditation journey! The morning sessions
                    have transformed my daily routine. Feeling more peaceful and
                    centered than ever. Next stop is to Keep the meditation
                    consistency 🧘‍♀️
                  </p>
                  <div className="rounded-xl overflow-hidden mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop"
                      alt="Meditation setup with cushions and plants"
                      width={600}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">24</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">8</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-gray-700 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="hover:text-gray-700 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="David Chen"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">David Chen</h3>
                    <span className="text-xs text-gray-500">2hr ago</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    Just discovered the power of pranayama breathing techniques!
                    Started with Raja Shodhan Alternate Nostril breathing and
                    its amazing for anxiety relief. Would love to hear your
                    favorite breathing exercises! #WellnessJourney
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-semibold">
                          📖
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          Breathing Techniques Guide
                        </h4>
                        <p className="text-gray-600 text-xs">PDF • 2.3 MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">18</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">12</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-gray-700 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="hover:text-gray-700 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80">
            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Active Members</h2>
                <span className="text-sm text-orange-500 cursor-pointer hover:underline">
                  View All
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                    name: "User 1",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                    name: "User 2",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                    name: "User 3",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                    name: "User 4",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
                    name: "User 5",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
                    name: "User 6",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
                    name: "User 7",
                  },
                  {
                    src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face",
                    name: "User 8",
                  },
                ].map((user, index) => (
                  <Image
                    key={index}
                    src={user.src}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Trending Now</h2>
                <span className="text-sm text-orange-500 cursor-pointer hover:underline">
                  See All
                </span>
              </div>

              <div className="space-y-4">
                {/* Morning Meditation Challenge */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      Morning Meditation Challenge
                    </h3>
                    <p className="text-gray-600 text-xs mb-1">
                      Join participants • Active 18h ago
                    </p>
                    <p className="text-xs text-gray-500">
                      Join 3 of the challenge with the details. Feeling more
                      stressed and successful...
                    </p>
                  </div>
                </div>

                {/* Beginner's Guide to Vinyasa Flow */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      Beginners Guide to Vinyasa Flow
                    </h3>
                    <p className="text-gray-600 text-xs mb-1">
                      98 comments • Active 15h ago
                    </p>
                    <p className="text-xs text-gray-500">
                      Our complete explore the correct alignments for
                      fundamental... Sarah
                    </p>
                  </div>
                </div>

                {/* Mindfulness for Anxiety Relief */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      Mindfulness for Anxiety Relief
                    </h3>
                    <p className="text-gray-600 text-xs mb-1">
                      52 participants • Popular
                    </p>
                    <p className="text-xs text-gray-500">
                      Top breathing techniques demonstrates shared tips through
                      a book about awesome... Jennifer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
