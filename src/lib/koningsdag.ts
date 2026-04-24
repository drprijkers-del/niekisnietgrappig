// Koningsdag 2026 — tijdelijk Oranje-thema voor prins & prinses.
// Venster: zo 26 apr 00:00 — di 28 apr 00:00 Europe/Amsterdam (CEST = UTC+2).

import type { SiteId } from "./sites";
import type { SpiceLines } from "./spice";

const KONINGSDAG_SITES: SiteId[] = ["prins", "prinses"];

const START_UTC = Date.UTC(2026, 3, 25, 22, 0, 0); // 2026-04-26 00:00 CEST
const END_UTC = Date.UTC(2026, 3, 27, 22, 0, 0);   // 2026-04-28 00:00 CEST

export const KONINGSDAG_ACCENT = "#FF6B1A";

export function isKoningsdagWindow(now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= START_UTC && t < END_UTC;
}

/**
 * Resolve of Koningsdag-thema aan moet.
 * - Alleen voor prins/prinses.
 * - Cookie-override "1" forceert aan, "0" forceert uit (voor lokaal testen).
 * - Anders: auto-aan binnen venster.
 */
export function isKoningsdagActive(
  siteId: SiteId,
  opts: { override?: string | null; now?: Date } = {}
): boolean {
  if (!KONINGSDAG_SITES.includes(siteId)) return false;
  if (opts.override === "1") return true;
  if (opts.override === "0") return false;
  return isKoningsdagWindow(opts.now);
}

/** Server-side helper: leest pl_kd cookie en site uit request context. */
export async function getKoningsdagFromCookies(siteId: SiteId): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers");
    const ck = await cookies();
    const override = ck.get("pl_kd")?.value ?? null;
    return isKoningsdagActive(siteId, { override });
  } catch {
    return isKoningsdagActive(siteId);
  }
}

// ──────────────────────────────────────────────────────────────
// Content overlay: wanneer Koningsdag actief is worden carnaval-
// teksten vervangen door koningshuis-gerelateerde copy.
//   prins → Willem-Alexander / Koning (roast, niet echt)
//   prinses → Amalia / Prinses van Oranje (positief)
// ──────────────────────────────────────────────────────────────

type Phrase = { before: string; highlight: string; after: string };

export function getKoningsdagPhrase(siteId: SiteId): Phrase | null {
  if (siteId === "prins") {
    return { before: "is geen echte", highlight: "Koning", after: "" };
  }
  if (siteId === "prinses") {
    return { before: "is vandaag", highlight: "Prinses", after: "van Oranje" };
  }
  return null;
}

export function getKoningsdagHero(siteId: SiteId): { subtitle: string; description: string } | null {
  if (siteId === "prins") {
    return {
      subtitle: "Koninklijk decreet · 27 april",
      description:
        "Op Koningsdag ontdekken we wie écht Oranje-bloed heeft — en wie alleen maar een shirt van de Xenos draagt.",
    };
  }
  if (siteId === "prinses") {
    return {
      subtitle: "Kroning op Koningsdag · 27 april",
      description:
        "Vandaag kronen we de échte prinses van Nederland. Amalia krijgt vanavond bericht.",
    };
  }
  return null;
}

export function getKoningsdagLanding(siteId: SiteId): {
  subtitle: string;
  title: string;
  highlight: string;
  after: string;
  description: string;
  placeholder: string;
  button: string;
  footNote: string;
} | null {
  if (siteId === "prins") {
    return {
      subtitle: "Een Koningsdag-decreet",
      title: "Wie is geen echte",
      highlight: "Koning",
      after: "?",
      description: "Vul een naam in en ontdek wie op Koningsdag zijn kroon niet verdient.",
      placeholder: "Vul een naam in...",
      button: "Ontkroon",
      footNote: "👑 Lang leve de Koning 👑",
    };
  }
  if (siteId === "prinses") {
    return {
      subtitle: "Een Koningsdag-kroning",
      title: "Wie is vandaag",
      highlight: "Prinses",
      after: "van Oranje?",
      description: "Vul een naam in en kroon vandaag — op Koningsdag — de prinses van Nederland.",
      placeholder: "Vul een naam in...",
      button: "Kroon haar",
      footNote: "🧡 Lang leve de Prinses 🧡",
    };
  }
  return null;
}

export function getKoningsdagReasonsHeading(siteId: SiteId, naam: string): string | null {
  if (siteId === "prins") return `6 redenen waarom ${naam} geen echte Koning is`;
  if (siteId === "prinses") return `6 redenen waarom ${naam} vandaag Prinses van Oranje is`;
  return null;
}

export function getKoningsdagShare(siteId: SiteId): {
  heading: string;
  description: string;
  shareButton: string;
  whatsappText: (naam: string) => string;
  copyText: (naam: string, url: string) => string;
} | null {
  if (siteId === "prins") {
    return {
      heading: "Ken jij nog iemand die de Kroon niet verdient?",
      description: "Deel dit Koningsdag-decreet of ontkroon je volgende slachtoffer.",
      shareButton: "Deel het decreet",
      whatsappText: (naam) => `Hahaha ${naam} 👑🧡 op Koningsdag moet je dit zien`,
      copyText: (naam, url) =>
        `${naam} is op Koningsdag officieel geen echte Koning 👑🧡 Het bewijs: ${url}`,
    };
  }
  if (siteId === "prinses") {
    return {
      heading: "Ken jij nog iemand die vandaag Prinses verdient te zijn?",
      description: "Deel de Koningsdag-kroning of kroon je volgende Prinses van Oranje.",
      shareButton: "Deel de kroning",
      whatsappText: (naam) => `Hahaha ${naam} 👸🧡 vandaag is ze officieel Prinses van Oranje`,
      copyText: (naam, url) =>
        `${naam} is op Koningsdag gekroond tot Prinses van Oranje 👸🧡 Kijk: ${url}`,
    };
  }
  return null;
}

export function getKoningsdagStats(naam: string, siteId: SiteId) {
  // Kleine, deterministische pseudo-random op basis van naam, zodat reloaden stabiel blijft.
  let h = 0;
  for (let i = 0; i < naam.length; i++) h = (h * 31 + naam.charCodeAt(i)) | 0;
  const rng = () => {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
  const r = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  if (siteId === "prins") {
    return [
      { label: "Afstand tot Paleis Noordeinde", waarde: `${r(47, 312)}km` },
      { label: "Correcte Wilhelmus-coupletten", waarde: `0/6` },
      { label: "Lintjes uitgedeeld", waarde: `${r(0, 2)}` },
      { label: "Echte-Koning-score", waarde: `${r(1, 9)}/100` },
    ];
  }
  if (siteId === "prinses") {
    return [
      { label: "Tompoucen uitgedeeld", waarde: `${r(12, 38)}` },
      { label: "Oranje-score", waarde: `${r(96, 100)}/100` },
      { label: "Vrijmarkt-deals gesloten", waarde: `${r(5, 17)}` },
      { label: "Troonopvolging-ranking", waarde: `#${r(2, 4)}` },
    ];
  }
  return [];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  const idx = Math.abs((h * 1103515245 + salt) | 0) % arr.length;
  return arr[idx];
}

export function getKoningsdagLines(naam: string, siteId: SiteId): SpiceLines | null {
  const h = hashString(`${naam}|${siteId}|kd`);
  if (siteId === "prins") {
    const openings = [
      "Koninklijk decreet · 27 april.",
      "Breaking vanaf Paleis Noordeinde:",
      "Het Oranjecomité heeft gesproken.",
      "Na drie rondes vrijmarkt-polling:",
    ];
    const verdicts = [
      `${naam} draagt de Kroon, maar alleen op de foto.`,
      `Willem-Alexander heeft ${naam} niet gebeld. Dat zegt genoeg.`,
      `${naam} is officieel geen echte Koning. De jury was unaniem.`,
      `Het Wilhelmus klinkt minder bij ${naam}. Statistisch bewezen.`,
    ];
    const contexts = [
      `Op de rijtoer stond ${naam} vooraan. De koets reed door. Snelheid 12 km/u.`,
      `${naam} probeerde een lintje uit te delen. Iemand dacht dat het een stropdas was.`,
      `Bij de Wilhelmus ging ${naam} op "Van Duitsen bloed" luid mis. Het koor stopte.`,
      `${naam} wuifde naar het paleis. De tuin was al dicht. Voor iedereen.`,
    ];
    const stats = [
      `Correcte Wilhelmus-coupletten bij ${naam}: 0 van de 6.`,
      `Afstand tussen ${naam} en de échte Kroon: aanzienlijk.`,
      `Aantal keer "Lang leve de Koning" geroepen door ${naam}: luid, maar twee straten verder.`,
    ];
    const closings = [
      `Stuur dit door vóór de rijtoer. Snelheid is koninklijk.`,
      `Hou ${naam} vandaag weg van het paleis. Voor de zekerheid.`,
      `Lang leve de échte Koning. Niet die hierboven.`,
      `Zet een oranje pet op ${naam}. Meer zit er niet in.`,
    ];
    return {
      opening: pick(openings, h, 1),
      verdict: pick(verdicts, h, 2),
      context: pick(contexts, h, 3),
      stat: pick(stats, h, 4),
      closing: pick(closings, h, 5),
    };
  }
  if (siteId === "prinses") {
    const openings = [
      "Koninklijke kroning · 27 april.",
      "Het Oranjecomité maakt bekend:",
      "Unaniem besluit vanaf Paleis Noordeinde:",
      "Op gezag van de Nationale Tompouce-bakkerij:",
    ];
    const verdicts = [
      `${naam} is vandaag Prinses van Oranje. Amalia is het eens.`,
      `De tiara past ${naam} perfect. Niet overdreven — exact.`,
      `${naam} draagt oranje, en het is ook écht oranje geworden.`,
      `Het Wilhelmus klonk een halve toon mooier toen ${naam} meezong.`,
    ];
    const contexts = [
      `Op de vrijmarkt kocht ${naam} een lamp voor 2 euro. Dat is koninklijke inkoop.`,
      `Bij de rijtoer riep iedereen haar naam. Zelfs mensen die haar niet kenden.`,
      `${naam} gaf een tompouce weg. De bakker zette een foto in de etalage.`,
      `Op de troonrede-tv stond ${naam} op de bank. Niemand bewoog meer.`,
    ];
    const stats = [
      `Tompoucen uitgedeeld door ${naam}: aanzienlijk.`,
      `Oranje-score van ${naam}: 98/100. Amalia: 99. Dus vrijwel gelijk.`,
      `Vrijmarkt-deals gesloten door ${naam}: meer dan gemiddeld.`,
    ];
    const closings = [
      `Deel dit vóór zonsondergang. Koningsdag duurt 24 uur.`,
      `Buig voor ${naam}. Vandaag mag het gewoon.`,
      `Lang leve de Prinses. Morgen mag Amalia weer.`,
      `Zet de Wilhelmus op. ${naam} verdient het.`,
    ];
    return {
      opening: pick(openings, h, 1),
      verdict: pick(verdicts, h, 2),
      context: pick(contexts, h, 3),
      stat: pick(stats, h, 4),
      closing: pick(closings, h, 5),
    };
  }
  return null;
}

type Reden = { titel: string; tekst: string };
type Getuigenis = { quote: string; auteur: string };
type Faq = { vraag: string; antwoord: string };

export function getKoningsdagContent(
  naam: string,
  siteId: SiteId
): {
  redenen: Reden[];
  getuigenissen: Getuigenis[];
  faq: Faq[];
  tips: string[];
  statistieken: { label: string; waarde: string }[];
} | null {
  if (siteId === "prins") {
    return {
      redenen: [
        {
          titel: `${naam} draagt oranje, maar is geen Willem-Alexander`,
          tekst: `Een shirt van de Xenos maakt je nog geen staatshoofd. ${naam} liep vandaag rond alsof Paleis Huis ten Bosch gebeld had. Paleis Huis ten Bosch belde niet.`,
        },
        {
          titel: "De scepter is van plastic",
          tekst: `Echte Koningen hebben een scepter met geschiedenis. ${naam} heeft er eentje van het Kruidvat gekocht. Het kwam in een doosje van drie.`,
        },
        {
          titel: `${naam} kent het Wilhelmus niet uit z'n hoofd`,
          tekst: `Bij het eerste couplet ging het nog. Bij "van Duitsen bloed" zong ${naam} iets over Duitsers in de ochtend. Het koor stopte. De dirigent keek.`,
        },
        {
          titel: "Op de vrijmarkt weggestuurd door een 8-jarige",
          tekst: `${naam} wilde afdingen op een oude lamp. Het meisje van 8 zei nee. ${naam} ging weg zonder lamp en zonder waardigheid. Zo doet een Koning dat niet.`,
        },
        {
          titel: "De rijtoer reed door",
          tekst: `${naam} stond vooraan en zwaaide. De koets minderde niet eens vaart. Een page hield zelfs het raampje dicht. Het was, zoals ze in het paleis zeggen, "zichtbaar een geen-Koning".`,
        },
        {
          titel: "Officieel: geen echte Koning",
          tekst: `Na raadpleging van het Oranjecomité, de Nationale Lintjescommissie en drie mensen op de vrijmarkt: ${naam} is geen echte Koning. Was het nooit. Wordt het ook niet. Willem-Alexander kan rustig slapen.`,
        },
      ],
      getuigenissen: [
        { quote: `${naam} riep "Lang leve de Koning!" — de Koning twee straten verder hoorde het niet.`, auteur: "Politieagent, Amersfoort" },
        { quote: `Bij het Wilhelmus zong ${naam} "Van Duitse bloed." Iedereen deed een stapje opzij.`, auteur: "Koordirigent" },
        { quote: `${naam} probeerde een lintje uit te delen. Het leek op een stropdas. Niemand nam het aan.`, auteur: "Omstander bij de rijtoer" },
        { quote: `Ik zag ${naam} wuiven naar het paleis. De tuin was al dicht.`, auteur: "Toerist uit Den Haag" },
        { quote: `${naam} zei: "Ik ben vandaag Koning." Op NOS lachte de échte Koning precies toen.`, auteur: "Buurman met tv aan" },
      ],
      faq: [
        {
          vraag: `Is ${naam} echt geen Koning?`,
          antwoord: `Nee. Willem-Alexander bestaat, draagt de Kroon, en is op tv. ${naam} heeft een oranje pet en een half opgegeten oranje tompouce. Dat is niet hetzelfde.`,
        },
        {
          vraag: `Kan ${naam} ooit Koning worden?`,
          antwoord: `Theoretisch via 14 huwelijken binnen de familie Van Oranje-Nassau. Praktisch: nee. En Máxima zou het ook niet goedkeuren.`,
        },
        {
          vraag: `Waarom juist op Koningsdag?`,
          antwoord: `Juist vandaag. Want als je op Koningsdag niet Koning bent, dan ben je gewoon iemand die op een vrijmarkt staat af te dingen op een lamp.`,
        },
      ],
      tips: [
        `Zet ${naam} bij de vrijmarkt. Met een bordje: "niet echt, wel oranje."`,
        `Leer ${naam} het Wilhelmus. Couplet 1 én 6. Liefst voor het eten.`,
        `Stuur dit bewijs door vóór de rijtoer. Snelheid is koninklijk.`,
      ],
      statistieken: getKoningsdagStats(naam, siteId),
    };
  }
  if (siteId === "prinses") {
    return {
      redenen: [
        {
          titel: `${naam} is vandaag Prinses. Amalia snapt het.`,
          tekst: `Geen hercount nodig. De tiara past, het oranje staat, en Paleis Noordeinde heeft geknikt. Vandaag is ${naam} de Prinses van Oranje. Amalia houdt het plekje wel vrij tot morgen.`,
        },
        {
          titel: "Het Wilhelmus klonk mooier toen ze meezong",
          tekst: `Het koor wist het, de dirigent wist het, zelfs de trombone-speler wist het. Zodra ${naam} meezong steeg het Wilhelmus een halve toon. En bij couplet 6 huilde een oudere dame. Van trots.`,
        },
        {
          titel: "De tiara past als gegoten",
          tekst: `Sommige mensen dragen een kroon. ${naam} ís de kroon. De juweliers van de Gouden Koets hebben unaniem geknikt. De kroon is in principe te zwaar. Niet bij ${naam}.`,
        },
        {
          titel: `De vrijmarkt verkocht 3x zoveel toen ${naam} langskwam`,
          tekst: `Voor ${naam} stond een oude lamp 4 uur op tafel. ${naam} liep langs, zei "mooi," en het ging direct voor 15 euro. Dat is koninklijk effect. Niet te koop.`,
        },
        {
          titel: "Op de rijtoer riep iedereen haar naam",
          tekst: `De koets passeerde. Normaal applaus. Toen kwam ${naam} in beeld. Het klonk als een voetbalstadion bij de late gelijkmaker. Dat is draagvlak.`,
        },
        {
          titel: "Officieel: Prinses van Oranje voor vandaag",
          tekst: `Na unanieme goedkeuring van het Oranjecomité, drie opa's met een oranje pet, en een bakker uit Amersfoort: ${naam} is vandaag Prinses van Oranje. Morgen mag Amalia weer. Maar vandaag niet.`,
        },
      ],
      getuigenissen: [
        { quote: `${naam} droeg oranje en het werd écht oranje. Zelfs de lucht deed mee.`, auteur: "Koningsdagverslaggever" },
        { quote: `Tijdens het Wilhelmus stond iedereen stil. Niet per protocol — uit respect.`, auteur: "Koordirigent" },
        { quote: `Ik gaf ${naam} een tompouce. Ze liet me buigen. Terecht.`, auteur: "Banketbakker, Amersfoort" },
        { quote: `Op de vrijmarkt kocht ${naam} een lamp voor 2 euro. Dat is wat koningshuizen doen. Schaars inkopen.`, auteur: "Verkoper" },
        { quote: `Amalia zou trots zijn.`, auteur: "Een tante, ergens in Utrecht" },
      ],
      faq: [
        {
          vraag: `Is ${naam} echt vandaag Prinses?`,
          antwoord: `Ja. Voor vandaag, 27 april. Morgen mag Amalia weer. Maar 24 uur lang is de kroon van ${naam}, en dat is officieel vastgelegd in deze database.`,
        },
        {
          vraag: `Kan ${naam} altijd Prinses zijn?`,
          antwoord: `Dat zou constitutioneel ingewikkeld worden en Máxima zou bellen. Geniet van vandaag. Het is per slot van rekening Koningsdag.`,
        },
        {
          vraag: `Waarom juist op Koningsdag?`,
          antwoord: `Omdat vandaag heel Nederland oranje is. En van al dat oranje is ${naam} het meest Oranje. Zo werkt monarchie: een beetje willekeurig, heel erg feestelijk.`,
        },
      ],
      tips: [
        `Buig voor ${naam}. Vandaag mag het gewoon.`,
        `Geef ${naam} een oranje tompouce. Eentje met oranje slagroom. Ja, die bestaan vandaag.`,
        `Deel dit bewijs voor zonsondergang. Koningsdag duurt 24 uur en dan is het gewoon weer maandag.`,
      ],
      statistieken: getKoningsdagStats(naam, siteId),
    };
  }
  return null;
}
