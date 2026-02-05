"use client";

import { useState } from "react";

type Period = "today" | "week" | "month" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Vandaag",
  week: "Week",
  month: "Maand",
  year: "Jaar",
  all: "All-time",
};

export default function DownloadLeaderboard({ secretKey }: { secretKey: string }) {
  const [loading, setLoading] = useState<Period | null>(null);
  const [open, setOpen] = useState(false);

  const handleDownload = async (period: Period) => {
    setLoading(period);
    try {
      const response = await fetch(`/api/og/leaderboard?key=${secretKey}&period=${period}`);
      const blob = await response.blob();

      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const filename = `leaderboard-${period}-${dateStr}.png`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-white transition-colors"
        title="Download leaderboard image for socials"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span className="hidden sm:inline">Download</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg py-1 min-w-[120px]">
          {(["today", "week", "month", "year", "all"] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => handleDownload(period)}
              disabled={loading !== null}
              className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading === period ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <span className="w-3" />
              )}
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
