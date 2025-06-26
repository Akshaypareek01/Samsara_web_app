"use client";

import Image from "next/image";
import { Star, MessageCircle, Pencil, Upload, Edit2, Eye } from "lucide-react";

export default function InstructorProfile() {
  return (
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
              src="/images/emily.svg"
              alt="Emily Richardson"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Name and Rating */}
        <div className="mt-3 pl-12">
          <h2 className="text-lg font-semibold">Emily Richardson</h2>
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
              <h3 className="text-orange-500 font-semibold text-md">1,240+</h3>
              <p className="text-xs text-gray-500">Classes</p>
            </div>
            <div className="bg-gray-100 rounded-xl px-4 py-3 text-center w-[130px]">
              <h3 className="text-orange-500 font-semibold text-md">8+</h3>
              <p className="text-xs text-gray-500">Years Experience</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center justify-center gap-1 bg-[#EB855F] hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm w-52">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
            <button className="bg-[#EB855F] hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm w-52 text-center">
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
                <Pencil className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                I m a certified yoga instructor with over 8 years of experience
                teaching various styles of yoga. My approach combines
                traditional practices with modern techniques to create a
                balanced experience for all levels.
                <br />
                <br />
                My teaching philosophy centers around mindfulness, proper
                alignment, and creating a supportive environment where students
                can explore and deepen their practice at their own pace. I
                believe yoga is for everybody and every body, and I strive to
                make my classes accessible while still offering challenges for
                more advanced practitioners.
              </p>
            </div>

            {/* Teaching Credentials */}
            <div className="bg-white p-6 pb-8 rounded-xl shadow-sm min-h-[390px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-black">
                  Teaching Credentials
                </h3>
                <button className="text-orange-500 text-sm font-medium hover:underline">
                  + Add New
                </button>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "RYT-500 Certification",
                    org: "Yoga Alliance",
                    date: "June 2018",
                  },
                  {
                    title: "Prenatal Yoga Certification",
                    org: "Mindful Birth Institute",
                    date: "March 2020",
                  },
                  {
                    title: "Meditation Teacher Training",
                    org: "Insight Meditation Center",
                    date: "January 2021",
                  },
                  {
                    title: "Yin Yoga Certification",
                    org: "Yin Yoga Institute",
                    date: "August 2022",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                        {item.title}
                        <span className="bg-green-100 text-green-600 text-[10px] font-medium px-2 py-[2px] rounded-full">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{item.org}</p>
                      <p className="text-sm text-gray-400">
                        Completed: {item.date}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Eye className="w-4 h-4 text-gray-400 cursor-pointer" />
                      <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                  </div>
                ))}
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
                <Pencil className="w-4 h-4 text-orange-500 cursor-pointer" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Vinyasa",
                  "Hatha",
                  "Meditation",
                  "Restorative",
                  "Prenatal",
                  "Yin",
                  "Breathwork",
                ].map((item, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-600 px-3 py-1 text-xs rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-semibold text-black">Gallery</h3>
                <button className="flex items-center gap-1 text-orange-500 text-sm hover:underline">
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>

              {/* Grid with no white space */}
              <div className="grid grid-cols-2 grid-rows-3 gap-[4px]">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="relative w-full h-[100px] sm:h-[120px] md:h-[140px] rounded-md overflow-hidden"
                  >
                    <Image
                      src={`/images/yoga${(i % 3) + 1}.svg`}
                      alt={`Yoga ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
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
                text: "I’ve been to many yoga classes. Emily’s advanced flow is truly special. Her sequencing is thoughtful and challenging.",
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
  );
}
