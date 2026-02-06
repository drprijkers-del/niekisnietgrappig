"use client";

import { ALL_SITES, type SiteId } from "@/lib/sites";

interface SiteDiscoveryProps {
  naam: string;
  lang: "nl" | "en";
  siteId: SiteId;
}

export default function SiteDiscovery({ naam, lang, siteId }: SiteDiscoveryProps) {
  const otherSites = ALL_SITES.filter((s) => s.siteId !== siteId && s.enabled);
  const isEN = lang === "en";

  return (
    <section className="border-t border-zinc-800 py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2">
          {isEN ? "There's more..." : "Er is meer..."}
        </p>
        <h2 className="text-center text-2xl font-bold sm:text-3xl mb-10">
          {isEN
            ? <>Curious what else <span className="text-zinc-400">{naam}</span> is?</>
            : <>Benieuwd wat <span className="text-zinc-400">{naam}</span> nog meer is?</>
          }
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherSites.map((site, i) => {
            const lowerNaam = naam.toLowerCase();
            let href = `https://${lowerNaam}.${site.domain}`;
            if (site.hasEnglish && lang === "en" && site.domainEn) {
              href = `https://${lowerNaam}.${site.domainEn}`;
            }

            const phrase = site.phrase;
            // Build display: "Niek is niet grappig" / "Niek, ga eens werken"
            const display = `${naam} ${phrase.before} ${phrase.highlight}${phrase.after ? " " + phrase.after : ""}`;

            return (
              <a
                key={site.siteId}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group animate-slide-in flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900"
                style={{ animationDelay: `${i * 0.07}s`, borderLeftWidth: "3px", borderLeftColor: site.accentColor }}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {display.split(phrase.highlight).map((part, j, arr) => (
                      <span key={j}>
                        {part}
                        {j < arr.length - 1 && (
                          <span style={{ color: site.accentColor }}>{phrase.highlight}</span>
                        )}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">{site.domain}</p>
                </div>
                <svg
                  className="w-4 h-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
