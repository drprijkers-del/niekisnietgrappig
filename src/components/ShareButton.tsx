"use client";

import { useState } from "react";

export default function ShareButton({
  naam,
  lang,
  label,
  copiedLabel,
}: {
  naam: string;
  lang: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText =
      lang === "en"
        ? `${naam} is not funny. The proof is here:`
        : `${naam} is niet grappig. Het bewijs is hier:`;
    const title =
      lang === "en" ? `${naam} is not funny` : `${naam} is niet grappig`;

    // Track the share
    fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    }).catch(() => {});

    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText} ${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-red-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
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
      {copied ? copiedLabel : label}
    </button>
  );
}
