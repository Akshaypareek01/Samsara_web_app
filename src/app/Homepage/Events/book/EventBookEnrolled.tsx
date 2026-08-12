"use client";

import type { Student } from "./eventBookTypes";

type EventBookEnrolledProps = {
  students: Student[];
};

/**
 * Enrolled students grid on the event book page.
 */
export default function EventBookEnrolled({ students }: EventBookEnrolledProps) {
  if (!students?.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-3">
        Enrolled Students ({students.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-orange-600">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{student.name}</p>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
