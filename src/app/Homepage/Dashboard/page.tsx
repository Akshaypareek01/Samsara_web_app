"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Static dashboard hub — redirect to Profile (live).
 */
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage/Dashboard/UserProfile");
  }, [router]);
  return null;
}
