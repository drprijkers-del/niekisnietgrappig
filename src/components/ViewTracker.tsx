"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ViewTracker({ naam }: { naam: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || undefined;
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, ref }),
    }).catch(() => {});
  }, [naam, searchParams]);

  return null;
}
