import Image from "next/image";
import { Calendar } from "lucide-react";

export default function WellnessDashboard() {
  return (
    <div className="px-6 py-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Welcome Text */}
          <div className="flex-1 mt-12">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
              <span className="font-semibold text-gray-700 text-[15px]">
                SAMSARA
              </span>
            </div>
            <h2 className="text-1xl font-bold text-gray-900 mb-2">
              Welcome to Your Wellness Journey
            </h2>
            <p className="text-gray-500 text-[12px] leading-5 mb-4">
              Discover personalized classes, join events, and connect with our
              wellness community.
            </p>
          </div>

          {/* Welcome Image */}
          <div className="w-full md:w-[350px] rounded-xl overflow-hidden">
            <Image
              src="/images/room.svg"
              alt="Wellness Room"
              width={500}
              height={300}
              className="object-cover w-full h-[200px] md:h-full"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card
            image="/images/yog1.svg"
            title="Events"
            items={[
              { label: "Morning Flow", sub: "Today, 8:00 AM" },
              { label: "Meditation Session", sub: "Tomorrow, 2:00 PM" },
            ]}
          />
          <Card
            image="/images/yog2.svg"
            title="Group Classes"
            items={[
              { label: "Yoga Basics", sub: "10 spots available" },
              { label: "Mindfulness", sub: "5 spots available" },
            ]}
          />
          <Card
            image="/images/yog3.svg"
            title="1:1 Classes"
            items={[
              { label: "Personal Training", sub: "Book a session" },
              {
                label: "Wellness Coaching",
                sub: "Schedule consultation",
              },
            ]}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
          Copyright© 2025 Samsara Wellness. All rights reserved. Powered by
          Samsara innovations
        </p>
      </div>
    </div>
  );
}

function Card({
  image,
  title,
  items,
}: {
  image: string;
  title: string;
  items: { label: string; sub: string }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow p-3 pb-4">
      <div className="rounded-xl overflow-hidden mb-3">
        <Image
          src={image}
          alt={title}
          width={400}
          height={200}
          className="w-full h-[160px] object-cover rounded-xl"
        />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col ml-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <div className="w-6 h-6 rounded-full  bg-[#F38A6A]/10 flex items-center justify-center">
                <Calendar size={14} />
              </div>
              {item.label}
            </div>
            <div className="text-xs text-gray-500 ml-9">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
