"use client";

import { ExternalLink, Play, Square } from "lucide-react";

type HostActionPanelProps = {
  /** Live meeting exists */
  hasMeeting: boolean;
  starting?: boolean;
  joining?: boolean;
  ending?: boolean;
  /** Show Start when no meeting (classes). Events omit Start. */
  showStart?: boolean;
  onStart?: () => void;
  onJoinAsHost: () => void;
  onEnd?: () => void;
  /** Extra hint under the title */
  hint?: string;
};

/**
 * Teacher/host CTA panel — company-portal orange styling.
 */
export default function HostActionPanel({
  hasMeeting,
  starting = false,
  joining = false,
  ending = false,
  showStart = false,
  onStart,
  onJoinAsHost,
  onEnd,
  hint,
}: HostActionPanelProps) {
  return (
    <section
      className="rounded-2xl border border-[#ffe0d0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden"
      aria-label="Host controls"
    >
      <div className="bg-[#fff4ef] px-5 py-4 border-b border-[#ffe0d0] flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#c95520] mb-0.5">
            Host controls
          </p>
          <h3 className="text-base font-bold text-gray-900">
            You&apos;re hosting this session
          </h3>
          {hint ? (
            <p className="text-xs text-gray-500 mt-1 max-w-md">{hint}</p>
          ) : null}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            hasMeeting
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasMeeting ? "bg-emerald-500" : "bg-gray-400"
            }`}
            aria-hidden
          />
          {hasMeeting ? "Live meeting ready" : "Not started"}
        </span>
      </div>

      <div className="p-5 space-y-2.5">
        {!hasMeeting && showStart && onStart ? (
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#ed662e] text-white text-sm font-semibold hover:bg-[#c95520] transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
          >
            <Play className="w-4 h-4" aria-hidden />
            {starting ? "Starting…" : "Start meeting"}
          </button>
        ) : null}

        {hasMeeting ? (
          <>
            <button
              type="button"
              onClick={onJoinAsHost}
              disabled={joining}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#ed662e] text-white text-sm font-semibold hover:bg-[#c95520] transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
            >
              <ExternalLink className="w-4 h-4" aria-hidden />
              {joining ? "Opening…" : "Join as host"}
            </button>
            {onEnd ? (
              <button
                type="button"
                onClick={onEnd}
                disabled={ending}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                <Square className="w-4 h-4" aria-hidden />
                {ending ? "Ending…" : "End meeting"}
              </button>
            ) : null}
          </>
        ) : !showStart ? (
          <p className="text-sm text-gray-600 bg-[#fff4ef]/60 rounded-xl px-4 py-3 border border-[#ffe0d0]">
            Meeting not started yet. Host join will appear once the live meeting
            is available.
          </p>
        ) : null}
      </div>
    </section>
  );
}
