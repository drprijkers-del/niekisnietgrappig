"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionId } from "@/lib/session";

export default function ViewTracker({ naam }: { naam: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    const ref = searchParams.get("ref") || undefined;
    const g = searchParams.get("g") || undefined;
    const sid = getSessionId();
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, ref, sid, g }),
    }).catch(() => {});
  }, [naam, searchParams]);

  return null;
}
