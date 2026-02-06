"use client";

import { useState } from "react";

type Result = {
  naam: string;
  views: number;
};

export default function GroupCheck({
  lang,
  currentNaam,
  compact = false,
}: {
  lang: "nl" | "en";
  currentNaam?: string;
  compact?: boolean;
}) {
  const [input, setInput] = useState(currentNaam ? currentNaam + ", " : "");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const isNL = lang === "nl";

  const handleCheck = async () => {
    const names = input
      .split(/[,\n]+/)
      .map((n) => n.trim().toLowerCase())
      .filter((n) => n.length > 0 && n.length <= 50);

    if (names.length < 2) return;

    setLoading(true);
    try {
      const res = await fetch("/api/group-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleShareWinner = () => {
    if (!results || results.length === 0) return;
    const winnerName = results[0].naam.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

    // Build battle page URL with names and scores for OG image
    const names = results.slice(0, 5).map(r => r.naam).join(",");
    const scores = results.slice(0, 5).map(r => r.views).join(",");
    const battleUrl = `https://isnietgrappig.com/battle?names=${encodeURIComponent(names)}&scores=${encodeURIComponent(scores)}${isNL ? "" : "&lang=en"}`;

    const text = isNL
      ? `Haha ${winnerName} is het minst grappig van ons! 😂 Check de battle resultaten:`
      : `Haha ${winnerName} is the least funny among us! 😂 Check the battle results:`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${battleUrl}`)}`,
      "_blank"
    );
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className={`${compact ? "mt-4" : "mt-6"} text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2`}
      >
        {currentNaam
          ? (isNL ? "🔥 Is iemand anders minder grappig?" : "🔥 Is someone else less funny?")
          : (isNL ? "Check je vriendengroep" : "Check your friend group")}
      </button>
    );
  }

  const winner = results && results.length > 0 ? results[0] : null;

  return (
    <div className={`${compact ? "mt-4" : "mt-8"} w-full max-w-sm mx-auto`}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-zinc-300 mb-1">
          {currentNaam
            ? (isNL ? "🔥 Battle check" : "🔥 Battle check")
            : (isNL ? "Check je vriendengroep" : "Check your friend group")}
        </h3>
        <p className="text-xs text-zinc-600 mb-4">
          {currentNaam
            ? (isNL
                ? "Voeg vrienden toe en check wie het minst grappig is"
                : "Add friends and check who's least funny")
            : (isNL
                ? "Wie van jullie is het minst grappig?"
                : "Who among you is least funny?")}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isNL ? "Jan, Piet, Klaas, Marie..." : "John, Pete, Chris, Marie..."}
          className="w-full h-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
          maxLength={500}
        />

        <button
          onClick={handleCheck}
          disabled={loading || input.trim().split(/[,\n]+/).filter(n => n.trim()).length < 2}
          className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
        >
          {loading ? "..." : (isNL ? "Check" : "Check")}
        </button>

        {results && (
          <div className="mt-4 rounded-lg bg-zinc-800/50 p-4">
            {winner && winner.views > 0 ? (
              <>
                <p className="text-xs text-zinc-500 mb-2">
                  {isNL ? "Van jullie groep:" : "From your group:"}
                </p>
                <p className="text-lg font-bold text-amber-400">
                  {winner.naam.replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
                </p>
                <p className="text-sm text-zinc-400">
                  {isNL ? "is het minst grappig" : "is the least funny"}
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  {winner.views}x {isNL ? "bekeken" : "views"}
                </p>
                {results.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-zinc-700 space-y-1">
                    {results.slice(1, 5).map((r, i) => (
                      <div key={r.naam} className="flex justify-between text-xs text-zinc-500">
                        <span>{i + 2}. {r.naam.replace(/(^|\s)\S/g, (c) => c.toUpperCase())}</span>
                        <span>{r.views}x</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Share button - always show when there are results */}
                <button
                  onClick={handleShareWinner}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {isNL ? "Deel dit resultaat!" : "Share this result!"}
                </button>
              </>
            ) : (
              <p className="text-sm text-zinc-500 text-center">
                {isNL
                  ? "Niemand van jullie staat nog in de rankings. Deel meer links!"
                  : "None of you are in the rankings yet. Share more links!"}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setShowForm(false);
            setResults(null);
            setInput(currentNaam ? currentNaam + ", " : "");
          }}
          className="mt-4 w-full text-xs text-zinc-600 hover:text-zinc-400"
        >
          {isNL ? "Sluiten" : "Close"}
        </button>
      </div>
    </div>
  );
}
