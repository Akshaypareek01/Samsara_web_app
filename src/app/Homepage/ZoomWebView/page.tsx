"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import {
  resolveZoomJoinUrl,
  shouldJoinAsZoomHost,
  type ZoomJoinPayload,
} from "@/lib/zoomJoin";
import { syncUserCookieFromProfile } from "@/lib/isOwnHost";

function ZoomWebViewContent() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const zoomData = searchParams.get("ZoomMeetingNumber");

    if (!zoomData) {
      setError("No meeting data provided");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let checkClosed: ReturnType<typeof setInterval> | undefined;

    /**
     * Same as mobile WebView:
     * - teacher → Meeting SDK + ZAK
     * - user → Zoom Web Client /wc/join (no ZAK)
     */
    const openMeeting = async () => {
      try {
        const payload = JSON.parse(zoomData) as ZoomJoinPayload;
        console.log("Zoom join payload ===>", {
          ...payload,
          pass: payload.pass ? "***" : undefined,
          password: payload.password ? "***" : undefined,
        });

        if (
          !payload.classId &&
          !payload.eventId &&
          !payload.sessionId &&
          !(payload.number || payload.meetingNumber)
        ) {
          setError("No classId, eventId, or meetingNumber provided");
          setIsLoading(false);
          return;
        }

        const token = Cookies.get("accessToken");
        let profileRole: string | null = null;

        if (token) {
          try {
            const res = await fetch(`${BASE_URL}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const profile = await res.json();
              const user = profile?.data || profile;
              profileRole = user?.role ? String(user.role) : null;
              if (user?.role || user?.id || user?._id) {
                syncUserCookieFromProfile(user);
              }
            }
          } catch (profileErr) {
            console.error("Failed to fetch profile for Zoom gate:", profileErr);
          }
        }

        if (cancelled) return;

        const asHost = shouldJoinAsZoomHost(payload, profileRole);
        console.log("Zoom join asHost ===>", asHost, {
          payloadRole: payload.role,
          appRole: payload.appRole,
          profileRole,
        });

        const joinUrl = await resolveZoomJoinUrl(
          BASE_URL,
          {
            ...payload,
            appRole: profileRole === "teacher" ? "teacher" : "user",
            userRole: profileRole || payload.userRole || payload.appRole,
          },
          asHost,
          token
        );

        if (cancelled) return;

        console.log("Zoom join URL ===>", joinUrl);
        setUrl(joinUrl);
        setIsLoading(false);

        const meetingWindow = window.open(
          joinUrl,
          "_blank",
          "noopener,noreferrer"
        );

        if (!meetingWindow) {
          setError(
            "Popup blocked. Please allow popups for this site and try again."
          );
          return;
        }

        checkClosed = setInterval(() => {
          if (meetingWindow.closed) {
            clearInterval(checkClosed);
          }
        }, 1000);
      } catch (err) {
        console.error("Error resolving Zoom join:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Invalid meeting data"
          );
          setIsLoading(false);
        }
      }
    };

    void openMeeting();

    return () => {
      cancelled = true;
      if (checkClosed) clearInterval(checkClosed);
    };
  }, [searchParams]);

  /**
   * Navigates back to the previous page.
   */
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-50">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading meeting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-50">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Join Meeting
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              {url ? (
                <button
                  onClick={() =>
                    window.open(url, "_blank", "noopener,noreferrer")
                  }
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Open Meeting
                </button>
              ) : null}
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
      >
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>

      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Meeting Opened
          </h2>
          <p className="text-gray-600 mb-6">
            The Zoom meeting has been opened in a new window. If it didn&apos;t
            open, check your popup blocker settings.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Open Meeting Again
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ZoomWebViewPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ZoomWebViewContent />
    </Suspense>
  );
}
