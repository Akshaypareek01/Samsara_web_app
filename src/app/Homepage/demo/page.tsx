"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Static demo dashboard — redirect to Home.
 */
export default function DemoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage");
  }, [router]);
  return null;
}
