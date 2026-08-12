"use client";

import { GraduationCap } from "lucide-react";
import type { Teacher } from "./eventBookTypes";
import LetterAvatar from "@/components/LetterAvatar";

type EventBookHostPanelProps = {
  teacher?: Teacher | null;
  hostImageUrl: string;
};

/**
 * Host card on the event book page (avatar, expertise, quals).
 */
export default function EventBookHostPanel({
  teacher,
  hostImageUrl,
}: EventBookHostPanelProps) {
  const photo =
    hostImageUrl && !hostImageUrl.includes("/images/logo.svg")
      ? hostImageUrl
      : undefined;

  return (
    <div className="bg-white rounded-xl border border-orange-100/80 shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-3">Your Host</h3>
      <div className="flex items-center gap-4 mb-4">
        <LetterAvatar
          name={teacher?.name || "Host"}
          src={photo}
          size={50}
          className="ring-2 ring-orange-100"
        />
        <div>
          <p className="font-medium text-sm">{teacher?.name || "Unknown Host"}</p>
          <p className="text-xs text-gray-500">
            {teacher?.teacherCategory || "Wellness Instructor"}
          </p>
          {teacher?.teachingExperience ? (
            <p className="text-xs text-gray-400">
              {teacher.teachingExperience} years experience
            </p>
          ) : null}
        </div>
      </div>

      {teacher?.expertise && teacher.expertise.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {teacher.expertise.map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-[#fff4ef] text-[#c95520] rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {teacher?.qualification && teacher.qualification.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <GraduationCap size={14} aria-hidden />
            Qualifications
          </h4>
          <ul className="space-y-1">
            {teacher.qualification.map((qual, index) => (
              <li key={index} className="text-xs text-gray-600">
                {qual.title}
                {qual.subtitle ? ` — ${qual.subtitle}` : ""}
                {qual.year ? ` (${qual.year})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
