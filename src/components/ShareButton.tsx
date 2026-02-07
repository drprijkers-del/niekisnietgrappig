"use client";

import { useState } from "react";
import { getSessionId } from "@/lib/session";
import { SiteId, SITES } from "@/lib/sites";

function getShareUrl(ref: string, siteId: SiteId, groupId?: string) {
  const url = new URL(window.location.href);
  const hostname = url.hostname;
  const w = url.searchParams.get("w");
  const g = groupId || url.searchParams.get("g");
  const site = SITES[siteId];

  const applyParams = (u: URL) => {
    u.searchParams.set("ref", ref);
    if (w) u.searchParams.set("w", w);
    if (g) u.searchParams.set("g", g);
  };

  // Check if already on a subdomain of any configured domain
  for (const s of Object.values(SITES)) {
    const subMatch = hostname.match(new RegExp(`^(.+)\\.${s.domain.replace(/\./g, "\\.")}$`));
    if (subMatch && subMatch[1] !== "www") {
      const shareUrl = new URL(`https://${hostname}`);
      applyParams(shareUrl);
      return shareUrl.toString();
    }
    if (s.domainEn) {
      const subMatchEn = hostname.match(new RegExp(`^(.+)\\.${s.domainEn.replace(/\./g, "\\.")}$`));
      if (subMatchEn && subMatchEn[1] !== "www") {
        const shareUrl = new URL(`https://${hostname}`);
        applyParams(shareUrl);
        return shareUrl.toString();
      }
    }
  }

  // Fallback: generate production subdomain URL using the site's domain
  const naam = url.pathname.split("/").filter(Boolean)[0];
  if (naam) {
    const shareUrl = new URL(`https://${decodeURIComponent(naam)}.${site.domain}`);
    applyParams(shareUrl);
    return shareUrl.toString();
  }

  // Ultimate fallback
  url.searchParams.delete("ref");
  url.searchParams.set("ref", ref);
  return url.toString();
}

export default function ShareButton({
  naam,
  lang,
  label,
  groupId,
  siteId = "grappig",
}: {
  naam: string;
  lang: string;
  label: string;
  groupId?: string;
  siteId?: SiteId;
}) {
  const [copied, setCopied] = useState(false);
  const site = SITES[siteId];

  const isLocal = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const trackShare = () => {
    if (isLocal) return;
    const sid = getSessionId();
    const ttShare = Math.round(performance.now() / 1000);
    const g = groupId || (typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("g") : null);
    fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, sid, ttShare, g }),
    }).catch(() => {});
  };

  const handleWhatsApp = () => {
    trackShare();
    const shareUrl = getShareUrl("wa", siteId, groupId);
    const text = site.share.whatsappText(naam);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      "_blank"
    );
  };

  const handleCopy = async () => {
    trackShare();
    const shareUrl = getShareUrl("copy", siteId, groupId);
    const copyText = site.share.copyText(naam, shareUrl);
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLabel = lang === "en" ? (copied ? "Link copied!" : "Copy link") : (copied ? "Link gekopieerd!" : "Kopieer link");

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        onClick={handleWhatsApp}
        className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        style={{ backgroundColor: site.accentColor }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {label}
      </button>
      <button
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium transition-all hover:bg-white hover:text-black hover:border-white"
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        )}
        {copyLabel}
      </button>
    </div>
  );
}
