"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionId } from "@/lib/session";

export default function ViewTracker({ naam }: { naam: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || undefined;
    const sid = getSessionId();
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, ref, sid }),
    }).catch(() => {});
  }, [naam, searchParams]);

  return null;
}
