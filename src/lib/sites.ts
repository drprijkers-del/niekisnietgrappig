// Central site configuration — the foundation of multi-domain support.
// Every domain-specific string, key prefix, and behavior lives here.

export type SiteId = "grappig" | "knor" | "honger" | "werken" | "liefste" | "lief" | "prins" | "prinses";

export interface SiteConfig {
  siteId: SiteId;
  domain: string;
  domainEn: string | null; // null for Dutch-only sites
  redisPrefix: string; // "" for grappig (backward compat), "knor" etc for new sites
  siteName: string;
  hasEnglish: boolean;
  enabled: boolean; // false = parked, hidden from discovery & public UI
  theme?: string; // e.g. "carnaval" — seasonal sites shown in separate section
  shareDomain?: string; // alternate domain for share URLs (when primary TLD isn't recognized by WhatsApp etc.)
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
    landingAfter?: string; // optional text after highlight (e.g. "doen" → "lief doen?")
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
    enabled: true,
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
    enabled: false, // parked — no domain live yet
    accentColor: "#f59e0b",
    phrase: { before: "is een", highlight: "knor", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. Het lidmaatschap is afgewezen.",
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
    enabled: true,
    accentColor: "#f97316",
    phrase: { before: "heeft", highlight: "honger", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. De koelkast is leeg.",
      footerLabel: "heefthonger",
      footerTLD: ".horse",
      footerCTA: "Deel de honger",
    },
    meta: {
      titleTemplate: "%s | Heeft Honger",
      defaultTitle: "Heeft Honger",
      description: "Het wetenschappelijk bewijs dat iemand altijd honger heeft.",
    },
    landing: {
      subtitle: "Een gastronomische noodmelding",
      title: "Wie heeft",
      description: "Typ een naam en ontdek het onomstotelijk bewijs.",
      placeholder: "Typ een naam...",
      button: "Ontmasker",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Meeste honger:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en officieel de hongerigste. Ken jij iemand met nóg meer honger?`,
      cta: "Wie heeft er nog meer honger?",
      ctaQuestion: "Ken jij iemand met nóg meer honger?",
    },
    share: {
      whatsappText: (naam) => `${naam} heeft honger. Weer. 😂🍕`,
      copyText: (naam, url) =>
        `${naam} heeft altijd honger en het is officieel bewezen 😂 ${url}`,
      heading: "Ken jij ook zo'n bodemloze put?",
      description: "Verspreid de honger of kies een nieuw slachtoffer.",
      battleText: (winnerName) =>
        `${winnerName} is officieel de hongerigste van ons 😂🍕 Check de battle:`,
    },
  },

  werken: {
    siteId: "werken",
    domain: "gaeenswerken.dog",
    domainEn: "youshouldbeworking.dog",
    redisPrefix: "werken",
    siteName: "Ga Eens Werken",
    hasEnglish: true,
    enabled: true,
    accentColor: "#22c55e",
    phrase: { before: ", ga eens", highlight: "werken", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. Productiviteit: niet gevonden.",
      footerLabel: "gaeenswerken",
      footerTLD: ".dog",
      footerCTA: "Deel de interventie",
    },
    meta: {
      titleTemplate: "%s | Ga Eens Werken",
      defaultTitle: "Ga Eens Werken",
      description: "Het wetenschappelijk bewijs dat iemand echt eens moet gaan werken.",
    },
    landing: {
      subtitle: "Een professionele interventie",
      title: "Wie moet eens gaan",
      description: "Typ een naam en ontdek waarom de bank geen werkplek is.",
      placeholder: "Typ een naam...",
      button: "Ontmasker",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Meest lui:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en officieel de luiste. Ken jij iemand die nóg minder uitvoert?`,
      cta: "Wie is er nog luier?",
      ctaQuestion: "Ken jij iemand die nóg minder uitvoert?",
    },
    share: {
      whatsappText: (naam) => `${naam} ga eens werken 😂`,
      copyText: (naam, url) =>
        `${naam} moet eens gaan werken. Officieel bewezen 😂 ${url}`,
      heading: "Ken jij ook zo'n bankhanger?",
      description: "Stuur deze interventie door of kies een nieuw doelwit.",
      battleText: (winnerName) =>
        `${winnerName} is officieel de luiste van ons 😂 Check de battle:`,
    },
  },

  liefste: {
    siteId: "liefste",
    domain: "isdeliefste.fan",
    domainEn: null,
    redisPrefix: "liefste",
    siteName: "Is De Liefste",
    hasEnglish: false,
    enabled: true,
    accentColor: "#ec4899",
    phrase: { before: "is de", highlight: "liefste", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. Bewezen de liefste.",
      footerLabel: "isdeliefste",
      footerTLD: ".fan",
      footerCTA: "Deel de liefde",
    },
    meta: {
      titleTemplate: "%s | Is De Liefste",
      defaultTitle: "Is De Liefste",
      description: "Het wetenschappelijk bewijs dat iemand de allerliefste is.",
    },
    landing: {
      subtitle: "Een hartverwarmend onderzoek",
      title: "Wie is de",
      description: "Typ een naam en ontdek wat de wetenschap al lang wist.",
      placeholder: "Typ een naam...",
      button: "Bewijs het",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "De allerliefste:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en officieel de allerliefste. Ken jij iemand die nóg liever is?`,
      cta: "Kies je volgende lieverd",
      ctaQuestion: "Ken jij iemand die nóg liever is?",
    },
    share: {
      whatsappText: (naam) => `${naam} kijk 🥰`,
      copyText: (naam, url) =>
        `${naam} is officieel de liefste. Bewezen door de wetenschap 🥰 ${url}`,
      heading: "Ken jij ook de liefste?",
      description: "Verspreid de liefde of verras een volgende lieverd.",
      battleText: (winnerName) =>
        `${winnerName} is officieel de allerliefste van ons 🥰 Check de battle:`,
    },
  },

  lief: {
    siteId: "lief",
    domain: "doefflief.today",
    domainEn: null,
    redisPrefix: "lief",
    siteName: "Doe ff Lief",
    hasEnglish: false,
    enabled: true,
    accentColor: "#a855f7",
    phrase: { before: ", doe ff", highlight: "lief", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. Lief doen is geen optie, het is noodzaak.",
      footerLabel: "doefflief",
      footerTLD: ".today",
      footerCTA: "Deel de interventie",
    },
    meta: {
      titleTemplate: "%s | Doe ff Lief",
      defaultTitle: "Doe ff Lief",
      description: "Het wetenschappelijk bewijs dat iemand echt ff lief moet doen.",
    },
    landing: {
      subtitle: "Een dringende lief-interventie",
      title: "Wie moet ff",
      landingAfter: "doen",
      description: "Typ een naam en ontdek het wetenschappelijk bewijs.",
      placeholder: "Typ een naam...",
      button: "Ontmasker",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Moet het meest ff lief doen:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en moet dringend ff lief doen. Ken jij iemand die nóg meer lief moet doen?`,
      cta: "Wie moet er nóg meer lief doen?",
      ctaQuestion: "Ken jij iemand die ook ff lief moet doen?",
    },
    share: {
      whatsappText: (naam) => `${naam} doe ff lief 😤😂`,
      copyText: (naam, url) =>
        `${naam} moet ff lief doen. Officieel bewezen 😂 ${url}`,
      heading: "Ken jij ook zo'n chagrijn?",
      description: "Stuur deze interventie door of kies een nieuw doelwit.",
      battleText: (winnerName) =>
        `${winnerName} moet het meest ff lief doen van ons 😤😂 Check de battle:`,
    },
  },
  prins: {
    siteId: "prins",
    domain: "isgeenechteprins.pizza",
    domainEn: null,
    redisPrefix: "prins",
    siteName: "Is Geen Echte Prins",
    hasEnglish: false,
    enabled: true,
    theme: "carnaval",
    accentColor: "#eab308",
    phrase: { before: "is geen echte", highlight: "prins", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. De kroon is nep.",
      footerLabel: "isgeenechteprins",
      footerTLD: ".pizza",
      footerCTA: "Deel de waarheid",
    },
    meta: {
      titleTemplate: "%s | Is Geen Echte Prins",
      defaultTitle: "Is Geen Echte Prins",
      description: "Het wetenschappelijk bewijs dat iemand geen echte carnavalsprins is.",
    },
    landing: {
      subtitle: "Een carnavaleske onthulling",
      title: "Wie is geen echte",
      description: "Vul een naam in en ontdek wie zijn kroon niet verdient.",
      placeholder: "Vul een naam in...",
      button: "Ontmasker",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "Minst echte prins:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en officieel geen echte prins. Ken jij iemand die nóg minder prins is?`,
      cta: "Wie is er nóg minder prins?",
      ctaQuestion: "Ken jij iemand die nóg minder een echte prins is?",
    },
    share: {
      whatsappText: (naam) => `${naam} is geen echte prins 😂👑`,
      copyText: (naam, url) =>
        `${naam} is geen echte prins. De kroon is nep, officieel bewezen 👑😂 ${url}`,
      heading: "Ken jij ook iemand die geen echte prins is?",
      description: "Verspreid de waarheid of ontkroon je volgende slachtoffer.",
      battleText: (winnerName) =>
        `${winnerName} is officieel de minst echte prins van ons 😂👑 Check de battle:`,
    },
  },

  prinses: {
    siteId: "prinses",
    domain: "isvandaagprinses.hot",
    domainEn: null,
    redisPrefix: "prinses",
    siteName: "Is Vandaag Prinses",
    hasEnglish: false,
    enabled: true,
    theme: "carnaval",
    shareDomain: "isvandaagprinses.kiwi",
    accentColor: "#ec4899",
    phrase: { before: "is vandaag", highlight: "prinses", after: "" },
    og: {
      subtitle: "OFFICIEEL BEWEZEN",
      description: "Officieel vastgesteld. De kroon past perfect.",
      footerLabel: "isvandaagprinses",
      footerTLD: ".hot",
      footerCTA: "Deel het feest",
    },
    meta: {
      titleTemplate: "%s | Is Vandaag Prinses",
      defaultTitle: "Is Vandaag Prinses",
      description: "Het wetenschappelijk bewijs dat iemand vandaag de carnavalsprinses is.",
    },
    landing: {
      subtitle: "Een koninklijke carnavalsviering",
      title: "Wie is vandaag",
      description: "Vul een naam in en kroon de prinses van het carnaval.",
      placeholder: "Vul een naam in...",
      button: "Kroon haar",
    },
    battle: {
      resultTitle: "Battle Resultaten",
      leastLabel: "De echte prinses:",
      viewsLabel: "bekeken",
      ogDescription: (naam, score) =>
        `${naam} is ${score}x bekeken en officieel vandaag prinses. Ken jij iemand die nóg meer prinses is?`,
      cta: "Wie is er nóg meer prinses?",
      ctaQuestion: "Ken jij iemand die ook prinses verdient te zijn?",
    },
    share: {
      whatsappText: (naam) => `${naam} is vandaag prinses! 👸🎉`,
      copyText: (naam, url) =>
        `${naam} is vandaag officieel prinses van het carnaval 👸🎉 ${url}`,
      heading: "Ken jij ook iemand die prinses verdient te zijn?",
      description: "Deel het feest of kroon je volgende prinses.",
      battleText: (winnerName) =>
        `${winnerName} is officieel de prinses van ons carnaval 👸🎉 Check de battle:`,
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
  if (s.shareDomain) {
    DOMAIN_MAP.set(s.shareDomain, { siteId: s.siteId, locale: "nl" });
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
