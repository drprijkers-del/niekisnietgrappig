"use client";

import { useState } from "react";

export default function LeaderboardToggle({ total }: { total: number }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    const extra = document.getElementById("leaderboard-extra");
    if (extra) {
      extra.classList.toggle("hidden");
    }
    setExpanded((v) => !v);
  };

  return (
    <button
      onClick={toggle}
      className="text-zinc-400 hover:text-white transition-colors"
    >
      {expanded ? "Top 10" : `Show all (${total})`}
    </button>
  );
}
