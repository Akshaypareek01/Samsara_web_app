"use client";

import HostActionPanel from "@/components/HostActionPanel";

type EventHostActionsProps = {
  isHost: boolean;
  isEnrolled: boolean;
  meetingNumber?: string | null;
  joining: boolean;
  enrolledCount: number;
  eventStatus?: boolean;
  onJoinAsHost: () => void;
  onRegister: () => void;
  onJoinAsStudent: () => void;
  onBack: () => void;
};

/**
 * Event detail CTA: host join, register, or enrolled student join.
 */
export default function EventHostActions({
  isHost,
  isEnrolled,
  meetingNumber,
  joining,
  enrolledCount,
  eventStatus,
  onJoinAsHost,
  onRegister,
  onJoinAsStudent,
  onBack,
}: EventHostActionsProps) {
  if (isHost) {
    return (
      <div className="sticky top-4">
        <HostActionPanel
          hasMeeting={!!meetingNumber}
          showStart={false}
          joining={joining}
          onJoinAsHost={onJoinAsHost}
          hint="When the live meeting is ready, join as host to admit participants."
        />
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="sticky top-4 space-y-3">
        <button
          type="button"
          onClick={onRegister}
          className="w-full min-h-[48px] bg-[#ed662e] text-white py-4 px-6 rounded-xl text-base font-semibold hover:bg-[#c95520] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
        >
          Register for event
        </button>
        <p className="text-sm text-gray-500 text-center">
          {enrolledCount} participant{enrolledCount === 1 ? "" : "s"} enrolled
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-4">
      <div className="rounded-2xl border border-[#ffe0d0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="bg-[#fff4ef] px-5 py-4 border-b border-[#ffe0d0]">
          <h3 className="text-base font-bold text-gray-900">
            You&apos;re registered
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Join when the host starts the live meeting.
          </p>
        </div>
        <div className="p-5 space-y-2.5">
          {eventStatus && meetingNumber ? (
            <button
              type="button"
              onClick={onJoinAsStudent}
              disabled={joining}
              className="w-full min-h-[44px] bg-[#ed662e] text-white py-3 rounded-xl font-semibold hover:bg-[#c95520] transition disabled:opacity-50"
            >
              {joining ? "Joining…" : "Join event"}
            </button>
          ) : (
            <p className="text-sm text-gray-600 bg-[#fff4ef]/60 rounded-xl px-4 py-3 border border-[#ffe0d0]">
              Meeting not started yet
            </p>
          )}
          <button
            type="button"
            onClick={onBack}
            className="w-full min-h-[44px] border border-[#ffe0d0] bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-[#fff4ef] transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
