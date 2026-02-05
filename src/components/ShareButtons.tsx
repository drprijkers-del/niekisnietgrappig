"use client";

import { useState } from "react";
import { getUI, Lang } from "@/lib/content";

export default function ShareButtons({
  naam,
  lang,
}: {
  naam: string;
  lang: Lang;
}) {
  const [copied, setCopied] = useState(false);
  const ui = getUI(lang).share;

  const handleWhatsApp = () => {
    const shareText = ui.shareText(naam);

    fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    }).catch(() => {});

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`,
      "_blank"
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-t border-zinc-800 bg-zinc-950/50 py-20 px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{ui.heading}</h2>
        <p className="mt-4 text-zinc-400">{ui.description}</p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-all hover:bg-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {ui.shareButton(naam)}
            </button>
            <button
              onClick={handleCopy}
              title={copied ? ui.copied : (lang === "en" ? "Copy link" : "Kopieer link")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-all hover:bg-white hover:text-black hover:border-white"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          </div>
          <a
            href="/"
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-700 px-8 py-3 font-medium transition-all hover:bg-white hover:text-black hover:border-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {ui.create}
          </a>
        </div>
      </div>
    </section>
  );
}
