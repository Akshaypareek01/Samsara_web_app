"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Static Teaching mock — redirect to Scheduled Classes. */
export default function TeachingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage/Classes/Scheduled");
  }, [router]);
  return null;
}
