"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Orphan static demo — redirect to live Events list.
 */
export default function EventsBookOnlineRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage/Events");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-gray-500">
      Redirecting to Events…
    </div>
  );
}
