"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Static Moderator/My Body mock — redirect to Home.
 */
export default function ModeratorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage");
  }, [router]);
  return null;
}
