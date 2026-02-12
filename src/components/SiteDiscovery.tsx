"use client";

import { ALL_SITES, type SiteId, type SiteConfig } from "@/lib/sites";

interface SiteDiscoveryProps {
  naam?: string;
  lang: "nl" | "en";
  siteId: SiteId;
  compact?: boolean;
}

function SiteCard({ site, naam, lang, index, compact }: { site: SiteConfig; naam?: string; lang: "nl" | "en"; index: number; compact?: boolean }) {
  let href: string;
  if (naam) {
    const lowerNaam = naam.toLowerCase();
    href = `https://${lowerNaam}.${site.domain}`;
    if (site.hasEnglish && lang === "en" && site.domainEn) {
      href = `https://${lowerNaam}.${site.domainEn}`;
    }
  } else {
    href = `https://${site.domain}`;
  }

  const phrase = (lang === "en" && site.phraseEn) ? site.phraseEn : site.phrase;
  const displayNaam = naam || "...";
  const display = `${displayNaam} ${phrase.before} ${phrase.highlight}${phrase.after ? " " + phrase.after : ""}`;

  return (
    <a
      key={site.siteId}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group animate-slide-in flex items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-600 hover:bg-zinc-900 ${compact ? "gap-3 p-3" : "gap-4 p-4"}`}
      style={{ animationDelay: `${index * 0.07}s`, borderLeftWidth: "3px", borderLeftColor: site.accentColor }}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-semibold truncate ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
          {display.split(phrase.highlight).map((part, j, arr) => (
            <span key={j}>
              {part}
              {j < arr.length - 1 && (
                <span style={{ color: site.accentColor }}>{phrase.highlight}</span>
              )}
            </span>
          ))}
        </p>
        {!compact && <p className="text-xs text-zinc-600 mt-0.5">{(lang === "en" && site.domainEn) ? site.domainEn : site.domain}</p>}
      </div>
      <svg
        className={`shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400 ${compact ? "w-3 h-3" : "w-4 h-4"}`}
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
}

export default function SiteDiscovery({ naam, lang, siteId, compact }: SiteDiscoveryProps) {
  const currentSite = ALL_SITES.find((s) => s.siteId === siteId);
  const otherSites = ALL_SITES.filter((s) => s.siteId !== siteId && s.enabled);
  const isEN = lang === "en";

  const allSitesFlat = compact ? otherSites : otherSites.filter((s) => !s.theme);
  const regularSites = allSitesFlat;
  const themedGroups = new Map<string, typeof otherSites>();
  if (!compact) {
    for (const s of otherSites.filter((s) => s.theme)) {
      const group = themedGroups.get(s.theme!) || [];
      group.push(s);
      themedGroups.set(s.theme!, group);
    }
  }

  const themeLabels: Record<string, { nl: string; en: string; emoji: string }> = {
    carnaval: { nl: "Carnaval Specials", en: "Carnival Specials", emoji: "🎭" },
  };

  const ghostLabels: Record<string, { nl: string; en: string }> = {
    prins: { nl: "Iemand anders ontkronen", en: "Dethrone someone else" },
    prinses: { nl: "Iemand anders kronen", en: "Crown someone else" },
  };
  const ghostText = ghostLabels[siteId] || {
    nl: "Kies een volgend slachtoffer",
    en: "Choose the next victim",
  };

  return (
    <section className={`px-6 ${compact ? "py-10" : "border-t border-zinc-800 py-16"}`}>
      <div className="mx-auto max-w-4xl">
        <p className={`text-center font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2 ${compact ? "text-xs" : "text-sm"}`}>
          {isEN ? "There's more..." : "Er is meer..."}
        </p>
        <h2 className={`text-center font-bold ${compact ? "text-lg sm:text-xl mb-6" : "text-2xl sm:text-3xl mb-10"}`}>
          {naam
            ? (isEN
                ? <>Curious what else <span className="text-zinc-400">{naam}</span> is?</>
                : <>Benieuwd wat <span className="text-zinc-400">{naam}</span> nog meer is?</>)
            : (isEN
                ? <>Discover all variants</>
                : <>Ontdek alle varianten</>)
          }
        </h2>

        <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
          {regularSites.map((site, i) => (
            <SiteCard key={site.siteId} site={site} naam={naam} lang={lang} index={i} compact={compact} />
          ))}
          {naam && currentSite && (
            <a
              key="ghost"
              href={`https://${currentSite.domain}`}
              className={`group animate-slide-in flex items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 transition-all hover:border-zinc-500 hover:bg-zinc-900/60 ${compact ? "gap-3 p-3" : "gap-4 p-4"}`}
              style={{ animationDelay: `${regularSites.length * 0.07}s`, borderLeftWidth: "3px", borderLeftStyle: "dashed", borderLeftColor: currentSite.accentColor }}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-zinc-400 ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
                  {isEN ? ghostText.en : ghostText.nl}
                </p>
                {!compact && <p className="text-xs text-zinc-600 mt-0.5">{currentSite.domain}</p>}
              </div>
              <svg
                className={`shrink-0 transition-transform group-hover:scale-110 ${compact ? "w-3 h-3" : "w-4 h-4"}`}
                style={{ color: currentSite.accentColor }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </a>
          )}
        </div>

        {[...themedGroups.entries()].map(([theme, sites]) => {
          const label = themeLabels[theme] || { nl: theme, en: theme, emoji: "🎉" };
          return (
            <div key={theme} className={compact ? "mt-6" : "mt-10"}>
              <p className="text-center text-xs font-mono uppercase tracking-[0.25em] text-zinc-600 mb-4">
                {label.emoji} {isEN ? label.en : label.nl} {label.emoji}
              </p>
              <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
                {sites.map((site, i) => (
                  <SiteCard key={site.siteId} site={site} naam={naam} lang={lang} index={regularSites.length + i} compact={compact} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
