"use client";

import { useEffect } from "react";

export default function ViewTracker({ naam }: { naam: string }) {
  useEffect(() => {
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    }).catch(() => {});
  }, [naam]);

  return null;
}
