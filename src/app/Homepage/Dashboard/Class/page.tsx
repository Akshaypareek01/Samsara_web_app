"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Static Class dashboard mock — redirect to My Classes. */
export default function ClassDashRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Homepage/Classes");
  }, [router]);
  return null;
}
