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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = ui.shareText(naam);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: lang === "en" ? `${naam} is not funny` : `${naam} is niet grappig`,
        text: shareText,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="border-t border-zinc-800 bg-zinc-950/50 py-20 px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{ui.heading}</h2>
        <p className="mt-4 text-zinc-400">{ui.description}</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleShare}
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
            {copied ? ui.copied : ui.shareButton(naam)}
          </button>
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
