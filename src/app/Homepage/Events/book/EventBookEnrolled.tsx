"use client";

import type { Student } from "./eventBookTypes";

type StudentLike = Student | string | null | undefined;

type EventBookEnrolledProps = {
  students: StudentLike[];
};

/**
 * True when the roster entry is a populated student with a display name.
 * Details payloads often send raw id strings, which must not be treated as objects.
 * @param student - Roster entry
 */
function namedStudent(student: StudentLike): student is Student {
  return Boolean(
    student &&
      typeof student === "object" &&
      typeof student.name === "string" &&
      student.name.trim()
  );
}

/**
 * Enrolled students grid on the event book page.
 * Id-only rosters still show the count and never read `.name` on a string.
 */
export default function EventBookEnrolled({ students }: EventBookEnrolledProps) {
  if (!students?.length) return null;
  const named = students.filter(namedStudent);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-3">
        Enrolled Students ({students.length})
      </h3>
      {named.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {named.map((student) => (
            <div
              key={student._id || student.email || student.name}
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
      ) : null}
    </div>
  );
}
