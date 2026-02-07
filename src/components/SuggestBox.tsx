"use client";

import { useState, useEffect } from "react";

export default function SuggestBox({
  naam,
  siteId,
  accentColor,
  heading,
  placeholder,
  button,
  success,
  countLabel,
}: {
  naam: string;
  siteId: string;
  accentColor: string;
  heading: string;
  placeholder: string;
  button: string;
  success: string;
  countLabel: string;
}) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const storageKey = `suggest:${siteId}:${naam.toLowerCase()}`;

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) {
      setAlreadyDone(true);
    }
    fetch("/api/suggest")
      .then((r) => r.json())
      .then((d) => setCount(d.count || 0))
      .catch(() => {});
  }, [storageKey]);

  const handleSubmit = () => {
    if (!text.trim() || text.length > 140 || submitted || alreadyDone) return;

    fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, text: text.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        setSubmitted(true);
        setCount(d.count || count + 1);
        localStorage.setItem(storageKey, "1");
      })
      .catch(() => {});
  };

  if (alreadyDone) return null;

  return (
    <section className="py-12 px-6">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center space-y-4">
          {submitted ? (
            <>
              <p
                className="text-sm font-mono uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {success}
              </p>
              {count > 0 && (
                <p className="text-xs text-zinc-600">{countLabel.replace("{n}", String(count))}</p>
              )}
            </>
          ) : (
            <>
              <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500">
                {heading}
              </h4>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 140))}
                placeholder={placeholder}
                maxLength={140}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-700 tabular-nums">
                  {text.length}/140
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="rounded-full border px-5 py-2 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed border-zinc-700"
                  style={
                    text.trim()
                      ? {
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                          borderColor: `${accentColor}40`,
                        }
                      : undefined
                  }
                >
                  {button}
                </button>
              </div>
              {count > 0 && (
                <p className="text-[10px] text-zinc-700">
                  {countLabel.replace("{n}", String(count))}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
