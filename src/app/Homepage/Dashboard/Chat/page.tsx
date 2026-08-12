"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Static Chat mock — redirect home. */
export default function ChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage");
  }, [router]);
  return null;
}
