"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Static Community mock — redirect home. */
export default function CommunityRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage");
  }, [router]);
  return null;
}
