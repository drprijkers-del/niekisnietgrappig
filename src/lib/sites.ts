// Central site configuration — the foundation of multi-domain support.
// Every domain-specific string, key prefix, and behavior lives here.

export type SiteId = "grappig" | "knor" | "honger" | "werken" | "liefste" | "lief";

export interface SiteConfig {
  siteId: SiteId;
  domain: string;
  domainEn: string | null; // null for Dutch-only sites
  redisPrefix: string; // "" for grappig (backward compat), "knor" etc for new sites
  siteName: string;
  hasEnglish: boolean;
  accentColor: string; // hex for highlight in OG images etc

  // Phrase display: "{naam} is niet grappig" or "{naam}, ga eens werken"
  phrase: {
    before: string; // "is" / "is een" / "heeft" / ", ga eens" / "is de" / ", doe ff"
    highlight: string; // "niet" / "knor" / "honger" / "werken" / "liefste" / "lief"
    after: string; // "grappig" / "" (empty for most)
  };

  // OG image strings
  og: {
    subtitle: string; // "OFFICIEEL BEWEZEN"
    description: string; // below the name
    footerLabel: string; // "isnietgrappig"
    footerTLD: string; // ".com" / ".nl"
    footerCTA: string; // "Deel de waarheid"
  };

  // Meta / SEO
  meta: {
    titleTemplate: string; // "%s | Is Niet Grappig"
    defaultTitle: string;
    description: string;
  };

  // Landing page
  landing: {
    subtitle: string;
    title: string; // "Wie is" / "Wie is een"
    description: string;
    placeholder: string;
    button: string;
  };

  // Battle text
  battle: {
    resultTitle: string; // "Battle Resultaten"
    leastLabel: string; // "Minst grappig:" / "Meest knor:"
    viewsLabel: string; // "bekeken"
    ogDescription: (naam: string, score: number) => string;
    cta: string; // "Kies je volgende slachtoffer"
    ctaQuestion: string; // "Ken jij iemand die nog minder grappig is?"
  };

  // Share text
  share: {
    whatsappText: (naam: string) => string;
    copyText: (naam: string, url: string) => string;
    heading: string;
    description: string;
    battleText: (winnerName: string) => string;
  };
}

export const SITES: Record<SiteId, SiteConfig> = {
  grappig: {
    siteId: "grappig",
    domain: "isnietgrappig.com",
    domainEn: "isntfunny.com",
    redisPrefix: "", // backward compat — no migration needed
    siteName: "Is Niet Grappig",
    hasEnglish: true,
    accentColor: "#ef4444",
    phrase: { before: "is", highlight: "niet", after: "grappig" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "isnietgrappig",
      footerTLD: ".com",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Is Niet Grappig",
      defaultTitle: "Is Niet Grappig",
      description: "Ontdek het wetenschappelijk bewijs dat iemand niet grappig is.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie is",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Minst grappig:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken is de humor van ${naam} het meest meh... Ken jij iemand die nog minder grappig is?`,
      cta: "Kies je volgende slachtoffer",
      ctaQuestion: "Ken jij iemand die nog minder grappig is?",
    },
    share: {
      whatsappText: (naam) => `Hahaha ${naam} kijk 😂`,
      copyText: (naam, url) =>
        `${naam} is niet grappig en het is nu officieel 😂 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die niet grappig is?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      battleText: (winnerName) =>
        `Haha ${winnerName} is het minst grappig van ons! 😂 Check de battle resultaten:`,
    },
  },

  knor: {
    siteId: "knor",
    domain: "iseenknor.nl",
    domainEn: null,
    redisPrefix: "knor",
    siteName: "Is Een Knor",
    hasEnglish: false,
    accentColor: "#f59e0b",
    phrase: { before: "is een", highlight: "knor", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "iseenknor",
      footerTLD: ".nl",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Is Een Knor",
      defaultTitle: "Is Een Knor",
      description: "Ontdek het wetenschappelijk bewijs dat iemand een knor is.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie is een",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Meest knor:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken is ${naam} de grootste knor... Ken jij iemand die nog meer knor is?`,
      cta: "Kies je volgende slachtoffer",
      ctaQuestion: "Ken jij iemand die nog meer knor is?",
    },
    share: {
      whatsappText: (naam) => `Hahaha ${naam} kijk 😂`,
      copyText: (naam, url) =>
        `${naam} is een knor en het is nu officieel 😂 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die een knor is?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      battleText: (winnerName) =>
        `Haha ${winnerName} is de grootste knor van ons! 😂 Check de battle resultaten:`,
    },
  },

  honger: {
    siteId: "honger",
    domain: "heefthonger.horse",
    domainEn: null,
    redisPrefix: "honger",
    siteName: "Heeft Honger",
    hasEnglish: false,
    accentColor: "#f97316",
    phrase: { before: "heeft", highlight: "honger", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "heefthonger",
      footerTLD: ".horse",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Heeft Honger",
      defaultTitle: "Heeft Honger",
      description: "Ontdek het wetenschappelijk bewijs dat iemand altijd honger heeft.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie heeft",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Meeste honger:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken heeft ${naam} de meeste honger... Ken jij iemand met nog meer honger?`,
      cta: "Kies je volgende slachtoffer",
      ctaQuestion: "Ken jij iemand met nog meer honger?",
    },
    share: {
      whatsappText: (naam) => `Hahaha ${naam} kijk 😂`,
      copyText: (naam, url) =>
        `${naam} heeft honger en het is nu officieel 😂 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die altijd honger heeft?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      battleText: (winnerName) =>
        `Haha ${winnerName} heeft de meeste honger van ons! 😂 Check de battle resultaten:`,
    },
  },

  werken: {
    siteId: "werken",
    domain: "gaeenswerken.dog",
    domainEn: "youshouldbeworking.dog",
    redisPrefix: "werken",
    siteName: "Ga Eens Werken",
    hasEnglish: true,
    accentColor: "#22c55e",
    phrase: { before: ", ga eens", highlight: "werken", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "gaeenswerken",
      footerTLD: ".dog",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Ga Eens Werken",
      defaultTitle: "Ga Eens Werken",
      description: "Ontdek het wetenschappelijk bewijs dat iemand eens moet gaan werken.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie moet eens gaan",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Moet het meest werken:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken moet ${naam} het meest gaan werken... Ken jij iemand die nog harder moet werken?`,
      cta: "Kies je volgende slachtoffer",
      ctaQuestion: "Ken jij iemand die nog harder moet gaan werken?",
    },
    share: {
      whatsappText: (naam) => `Hahaha ${naam} kijk 😂`,
      copyText: (naam, url) =>
        `${naam}, ga eens werken! Het is nu officieel 😂 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die eens moet gaan werken?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      battleText: (winnerName) =>
        `Haha ${winnerName} moet het meest gaan werken van ons! 😂 Check de battle resultaten:`,
    },
  },

  liefste: {
    siteId: "liefste",
    domain: "isdeliefste.fan",
    domainEn: null,
    redisPrefix: "liefste",
    siteName: "Is De Liefste",
    hasEnglish: false,
    accentColor: "#ec4899",
    phrase: { before: "is de", highlight: "liefste", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "isdeliefste",
      footerTLD: ".fan",
      footerCTA: "Deel de liefde",
    },
    meta: {
      titleTemplate: "%s | Is De Liefste",
      defaultTitle: "Is De Liefste",
      description: "Ontdek het wetenschappelijk bewijs dat iemand de liefste is.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie is de",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "De liefste:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken is ${naam} de allerliefste... Ken jij iemand die nog liever is?`,
      cta: "Kies je volgende lieverd",
      ctaQuestion: "Ken jij iemand die nog liever is?",
    },
    share: {
      whatsappText: (naam) => `Aww ${naam} kijk 🥰`,
      copyText: (naam, url) =>
        `${naam} is de liefste en het is nu officieel 🥰 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die de liefste is?",
      description: "Verspreid de liefde of kies je volgende lieverd.",
      battleText: (winnerName) =>
        `Aww ${winnerName} is de liefste van ons! 🥰 Check de battle resultaten:`,
    },
  },

  lief: {
    siteId: "lief",
    domain: "doefflief.today",
    domainEn: null,
    redisPrefix: "lief",
    siteName: "Doe ff Lief",
    hasEnglish: false,
    accentColor: "#a855f7",
    phrase: { before: ", doe ff", highlight: "lief", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel onderzocht. Onomstotelijk vastgelegd.",
      footerLabel: "doefflief",
      footerTLD: ".today",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Doe ff Lief",
      defaultTitle: "Doe ff Lief",
      description: "Ontdek het wetenschappelijk bewijs dat iemand ff lief moet doen.",
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie moet ff",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Moet het meest ff lief doen:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `Met ${score}x bekeken moet ${naam} het meest ff lief doen... Ken jij iemand die nog meer ff lief moet doen?`,
      cta: "Kies je volgende slachtoffer",
      ctaQuestion: "Ken jij iemand die ook ff lief moet doen?",
    },
    share: {
      whatsappText: (naam) => `Hahaha ${naam} kijk 😂`,
      copyText: (naam, url) =>
        `${naam}, doe ff lief! Het is nu officieel 😂 Check hier de feiten: ${url}`,
      heading: "Ken jij ook iemand die ff lief moet doen?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      battleText: (winnerName) =>
        `Haha ${winnerName} moet het meest ff lief doen van ons! 😂 Check de battle resultaten:`,
    },
  },
};

// --- Lookup helpers ---

export const ALL_SITES = Object.values(SITES);

/** Normalize hostname: strip www. prefix and :port */
function normalizeHost(raw: string): string {
  return raw.replace(/^www\./i, "").split(":")[0].toLowerCase();
}

/** Fast domain → { siteId, locale } lookup table */
const DOMAIN_MAP = new Map<string, { siteId: SiteId; locale: string }>();
for (const s of ALL_SITES) {
  DOMAIN_MAP.set(s.domain, { siteId: s.siteId, locale: "nl" });
  if (s.domainEn) {
    DOMAIN_MAP.set(s.domainEn, { siteId: s.siteId, locale: "en" });
  }
}

/**
 * Look up site + locale from a hostname.
 * Handles exact match and subdomain match (niek.isnietgrappig.com → isnietgrappig.com).
 * Returns null for unknown hosts (localhost, vercel preview, etc).
 */
export function lookupDomain(hostname: string): { site: SiteConfig; locale: string } | null {
  const host = normalizeHost(hostname);

  // Exact domain match
  const exact = DOMAIN_MAP.get(host);
  if (exact) return { site: SITES[exact.siteId], locale: exact.locale };

  // Subdomain match
  for (const [domain, info] of DOMAIN_MAP) {
    if (host.endsWith(`.${domain}`)) {
      return { site: SITES[info.siteId], locale: info.locale };
    }
  }

  return null;
}

/** Get site config by matching hostname. Falls back to grappig. */
export function getSiteByDomain(hostname: string): SiteConfig {
  return lookupDomain(hostname)?.site ?? SITES.grappig;
}

/** Build a Redis key with site prefix. Empty prefix = no prefix (backward compat). */
export function redisKey(site: SiteConfig, key: string): string {
  return site.redisPrefix ? `${site.redisPrefix}:${key}` : key;
}

/**
 * Server-side helper: resolve the current site.
 * Priority: x-site-id header → domain lookup → pl_site cookie → default.
 */
export async function getCurrentSite(): Promise<SiteConfig> {
  const { headers, cookies } = await import("next/headers");
  const hdrs = await headers();

  // 1. x-site-id header (set by middleware, works in some runtimes)
  const hdrSiteId = hdrs.get("x-site-id") as SiteId | null;
  if (hdrSiteId && SITES[hdrSiteId]) return SITES[hdrSiteId];

  // 2. Domain lookup
  const host = hdrs.get("host") || "";
  const domResult = lookupDomain(host);
  if (domResult) return domResult.site;

  // 3. Cookie fallback (dev override via ?_site= → pl_site cookie)
  try {
    const ckStore = await cookies();
    const cookieSiteId = ckStore.get("pl_site")?.value as SiteId | undefined;
    if (cookieSiteId && SITES[cookieSiteId]) return SITES[cookieSiteId];
  } catch {
    // cookies() may throw in some contexts
  }

  // 4. Default
  return SITES.grappig;
}

/** Get site from a NextRequest (for API routes). */
export function getSiteFromRequest(request: {
  headers: { get(name: string): string | null };
  cookies?: { get(name: string): { value: string } | undefined };
}): SiteConfig {
  const siteId = request.headers.get("x-site-id") as SiteId | null;
  if (siteId && SITES[siteId]) return SITES[siteId];

  const host = request.headers.get("host") || "";
  const domResult = lookupDomain(host);
  if (domResult) return domResult.site;

  // Cookie fallback
  const cookieSiteId = request.cookies?.get("pl_site")?.value as SiteId | undefined;
  if (cookieSiteId && SITES[cookieSiteId]) return SITES[cookieSiteId];

  return SITES.grappig;
}
