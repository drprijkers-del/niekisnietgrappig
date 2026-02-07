"use client";

import { useEffect, useState } from "react";

export default function TopShared({ lang }: { lang: string }) {
  const [top, setTop] = useState<{ naam: string; count: number } | null>(null);

  useEffect(() => {
    fetch("/api/share")
      .then((res) => res.json())
      .then((data) => setTop(data.top))
      .catch(() => {});
  }, []);

  if (!top) return null;

  const isNiek = top.naam.toLowerCase() === "niek";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-5 py-2 text-xs text-zinc-500">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        {lang === "en" ? (
          <>
            #1 most confronted: <span className="text-zinc-300 font-medium">{top.naam}</span>{" "}
            <span className="text-zinc-600">({top.count}x)</span>
          </>
        ) : (
          <>
            #1 meest geconfronteerd: <span className="text-zinc-300 font-medium">{top.naam}</span>{" "}
            <span className="text-zinc-600">({top.count}x)</span>
          </>
        )}
      </div>
      {!isNiek && (
        <span className="text-[10px] text-zinc-700 italic">
          {lang === "en"
            ? "Niek remains not funny either, obviously."
            : "Niek blijft uiteraard ook niet grappig."}
        </span>
      )}
    </div>
  );
}
