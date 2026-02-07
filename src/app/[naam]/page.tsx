import { Metadata } from "next";
import { notFound } from "next/navigation";
import { capitalizeName, validateSpice } from "@/lib/utils";
import { getContent, getUI, Lang, getCustomSubtitle } from "@/lib/content";
import { getSpiceLines } from "@/lib/spice";
import { getCurrentSite } from "@/lib/sites";
import ShareButtons from "@/components/ShareButtons";
import ShareButton from "@/components/ShareButton";
import LanguageToggle from "@/components/LanguageToggle";
import TopShared from "@/components/TopShared";
import ViewTracker from "@/components/ViewTracker";
import GroupCheck from "@/components/GroupCheck";
import SiteDiscovery from "@/components/SiteDiscovery";
import SuggestBox from "@/components/SuggestBox";

// Simple group ID validation (alphanumeric + hyphens, max 24 chars)
function validateGroupId(g: unknown): string | null {
  if (typeof g !== "string") return null;
  const lower = g.toLowerCase().trim();
  if (!/^[a-z0-9-]{1,24}$/.test(lower)) return null;
  return lower;
}

type Props = {
  params: Promise<{ naam: string }>;
  searchParams: Promise<{ lang?: string; w?: string; ref?: string; g?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { naam: rawNaam } = await params;
  const { lang: langParam, ref, g } = await searchParams;
  const site = await getCurrentSite();
  const lang: Lang = langParam === "en" && site.hasEnglish ? "en" : "nl";
  const naam = capitalizeName(rawNaam);
  const groupId = validateGroupId(g);
  const isEN = lang === "en";

  const groupName = groupId
    ? groupId.split(/-+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : null;

  const ogDescription = (() => {
    if (groupName) {
      return isEN
        ? `Who in ${groupName} is least funny? Open to find out!`
        : `Wie in ${groupName} scoort het hoogst? Open om te ontdekken!`;
    }
    if (ref === "wa") {
      return isEN
        ? `Someone shared this with you — for good reason.`
        : `Dit kreeg je doorgestuurd — en terecht.`;
    }
    if (ref === "copy") {
      return isEN
        ? `This is already making the rounds.`
        : `Dit gaat al rond.`;
    }
    return isEN
      ? `Officially researched and documented.`
      : `Officieel onderzocht en vastgelegd.`;
  })();

  const phrase = site.phrase;
  const ogTitle = isEN
    ? (site.siteId === "werken"
        ? `${naam}, you should be working.`
        : `Is ${naam} funny? Science says no.`)
    : `${naam} ${phrase.before} ${phrase.highlight}${phrase.after ? " " + phrase.after : ""}`;

  const ogImageUrl = groupId
    ? `/api/og?naam=${encodeURIComponent(rawNaam)}&lang=${lang}&g=${encodeURIComponent(groupId)}`
    : `/api/og?naam=${encodeURIComponent(rawNaam)}&lang=${lang}`;

  return {
    title: isEN
      ? (site.siteId === "werken" ? `${naam} — You Should Be Working` : `${naam} Is Not Funny`)
      : `${naam} ${site.siteName}`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: isEN ? "Is Not Funny" : site.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
          type: "image/png",
        },
      ],
      locale: isEN ? "en_US" : "nl_NL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
    other: {
      "og:image:type": "image/png",
    },
  };
}

export default async function NaamPage({ params, searchParams }: Props) {
  const { naam: rawNaam } = await params;
  const { lang: langParam, w, g } = await searchParams;
  const site = await getCurrentSite();
  const lang: Lang = langParam === "en" && site.hasEnglish ? "en" : "nl";

  const decoded = decodeURIComponent(rawNaam);
  if (decoded.length > 50 || !/^[\p{L}\s'.-]+$/u.test(decoded)) {
    notFound();
  }

  const naam = capitalizeName(rawNaam);
  const groupId = validateGroupId(g);
  const siteId = site.siteId;

  const lowerName = decoded.toLowerCase();

  // Easter egg: Mamma — on ALL sites, always redirect to "Mamma is de liefste"
  if (lowerName === "mamma" || lowerName === "mama") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam="Mamma" />
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-950/30 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-pink-400">
              {siteId !== "liefste" ? "SYSTEEM OVERRIDE" : "ONDERZOEK OVERBODIG"}
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
              Mamma is de{" "}
              <span className="text-pink-400">liefste</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 italic -mt-4">
              {siteId !== "liefste"
                ? "Je probeerde een andere site. Het antwoord blijft hetzelfde."
                : "Dit hoefde niet onderzocht te worden."}
            </p>
            <div className="space-y-5 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              {siteId === "grappig" && <p>Je dacht dat mamma niet grappig is? Mamma is hilarisch. Maar bovenal: de liefste.</p>}
              {siteId === "honger" && <p>Mamma heeft geen honger. Mamma zorgt dat jij geen honger hebt. Dat is het verschil.</p>}
              {siteId === "werken" && <p>Mamma hoeft niet te gaan werken. Mamma werkt al harder dan iedereen. Altijd al gedaan.</p>}
              {siteId === "lief" && <p>Mamma moet ff lief doen? Mamma doet al lief. 24/7. Al je hele leven. Schaam je.</p>}
              {siteId === "liefste" && <p>Het onderzoeksteam heeft het dossier gesloten. Geen discussie mogelijk. Geen beroep. Mamma wint.</p>}
              <p className="text-zinc-500 italic text-base">Trust me... is beter zo.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-pink-400">∞</div><div className="mt-1 text-[11px] text-zinc-500">Jaren liefste</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-pink-400">0</div><div className="mt-1 text-[11px] text-zinc-500">Tegenargumenten</div></div>
            </div>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Mamma" lang={lang} label="Deel via WhatsApp" siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Mamma" lang={lang} siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Stichting Onbetwistbare Moeders</p>
          <p className="mt-1 text-[10px] text-zinc-800 italic">Niek dacht dat hij speciaal was. Mamma wist het zeker.</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  // Easter egg: Trump — only on grappig site, always English
  if (siteId === "grappig" && (lowerName === "trump" || lowerName === "donald trump" || lowerName === "president trump")) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam={naam} />
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-red-500 animate-pulse">
              A statement from the least funny president
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl uppercase">
              I am{" "}
              <span className="text-red-500">not</span>{" "}
              funny
            </h1>
            <div className="space-y-6 text-lg sm:text-xl text-zinc-300 leading-relaxed italic">
              <p>&quot;Look, everybody knows it. I&apos;m not funny. And frankly, I&apos;m the LEAST funny person you&apos;ve ever met. Nobody is less funny than me. I&apos;m number one at it. The fake news media tries to say other people aren&apos;t funny — wrong. I&apos;m the best at not being funny. Ask anyone.&quot;</p>
              <p>&quot;People come up to me — big, strong people, tough guys — and they say: &apos;Sir, that was the worst joke I&apos;ve ever heard.&apos; With tears in their eyes! Beautiful tears. I tell the worst jokes, everybody agrees. And I do it naturally. Tremendous talent. Some people study comedy for years. Sad! I just walk in and bomb. Every single time. It&apos;s a gift.&quot;</p>
              <p>&quot;Crooked comedians try to compete with me. They can&apos;t. My unfunniness is unmatched. It&apos;s probably the greatest unfunniness in the history of this country, maybe the world. We&apos;re looking into it. Many people are saying it.&quot;</p>
              <p className="not-italic text-red-400 font-bold text-2xl sm:text-3xl uppercase">Make comedy great again.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold tabular-nums">∞</div><div className="mt-1 text-[11px] text-zinc-500">Seconds of silence after his jokes</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold tabular-nums">100%</div><div className="mt-1 text-[11px] text-zinc-500">People laughing AT him</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold tabular-nums">0</div><div className="mt-1 text-[11px] text-zinc-500">Successful punchlines</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-red-500">HUGE</div><div className="mt-1 text-[11px] text-zinc-500">Level of unfunniness</div></div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center max-w-md mx-auto">
              <p className="text-base italic text-zinc-300">&quot;I have to agree. He&apos;s genuinely not funny.&quot;</p>
              <p className="mt-2 text-xs text-zinc-600">— Mark Rutte, NATO Secretary General</p>
            </div>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Trump" lang="en" label="Share via WhatsApp" siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Trump" lang="en" siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">This is satire. Please don&apos;t sue us.</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  // Easter egg: Dennis — only on grappig site
  if (siteId === "grappig" && lowerName === "dennis") {
    const isEN = lang === "en";
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam={naam} />
        {site.hasEnglish && <LanguageToggle lang={lang} />}
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-amber-400 animate-pulse">{isEN ? "ERROR 403 — ACCESS DENIED" : "FOUT 403 — TOEGANG GEWEIGERD"}</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">{isEN ? "Nice try." : "Leuk geprobeerd."}</h1>
            <p className="text-sm sm:text-base text-zinc-500 italic -mt-4">{isEN ? "he's actually kind of funny... my creator, after all" : "hij is nu net wél grappig... mijn creator dan"}</p>
            <div className="space-y-5 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              <p>{isEN ? "The algorithm tried to analyze Dennis. The algorithm crashed. Three times. Then it sent an apology email." : "Het algoritme probeerde Dennis te analyseren. Het algoritme crashte. Drie keer. Daarna stuurde het een excuus-e-mail."}</p>
              <p>{isEN ? "Turns out you can't roast the person who built the roast machine. It's not a bug — it's a feature." : "Je kunt blijkbaar niet iemand roasten die de roast-machine heeft gebouwd. Het is geen bug — het is een feature."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-amber-400">ERR</div><div className="mt-1 text-[11px] text-zinc-500">{isEN ? "Humor analysis failed" : "Humoranalyse mislukt"}</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-amber-400">N/A</div><div className="mt-1 text-[11px] text-zinc-500">{isEN ? "Conflict of interest" : "Belangenverstrengeling"}</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-amber-400">???</div><div className="mt-1 text-[11px] text-zinc-500">{isEN ? "Results: classified" : "Resultaten: geheim"}</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold text-amber-400">1</div><div className="mt-1 text-[11px] text-zinc-500">{isEN ? "There can be only one" : "Er kan er maar één zijn"}</div></div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center max-w-md mx-auto">
              <p className="text-sm font-mono text-zinc-500 mb-3">{isEN ? "// attempted_roasts.log" : "// geprobeerde_roasts.log"}</p>
              <div className="space-y-2 text-sm text-left font-mono">
                <p className="text-zinc-500"><span className="text-red-400">[FAIL]</span>{" "}{isEN ? "\"Dennis is not funny\" → rejected by system" : "\"Dennis is niet grappig\" → afgewezen door systeem"}</p>
                <p className="text-zinc-500"><span className="text-red-400">[FAIL]</span>{" "}{isEN ? "\"Dennis has bad timing\" → permission denied" : "\"Dennis heeft slechte timing\" → geen toestemming"}</p>
                <p className="text-zinc-500"><span className="text-amber-400">[WARN]</span>{" "}{isEN ? "Creator privilege detected. Aborting." : "Creator privilege gedetecteerd. Afgebroken."}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-700 italic">{isEN ? "Is this fair? No. Is this his website? Yes. There can be only one." : "Is dit eerlijk? Nee. Is dit zijn website? Ja. Er kan er maar één zijn."}</p>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Dennis" lang={lang} label={isEN ? "Share via WhatsApp" : "Deel via WhatsApp"} siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Dennis" lang={lang} siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">{isEN ? "This website was made by Dennis. Draw your own conclusions." : "Deze website is gemaakt door Dennis. Trek je eigen conclusies."}</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  // Easter egg: Nienke — only on liefste site
  if (siteId === "liefste" && lowerName === "nienke") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam={naam} />
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-950/30 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-pink-400">
              ONDERZOEK OVERBODIG
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
              Nienke is de{" "}
              <span className="text-pink-400">liefste</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 italic -mt-4">Dit hoefde niet onderzocht te worden. Iedereen wist het al.</p>
            <div className="space-y-5 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              <p>Het onderzoeksteam heeft unaniem besloten het dossier te sluiten. De conclusie was al getrokken voordat het eerste formulier was ingevuld.</p>
              <p>Nienke scoort 100% op elke meting. Lievigheid: maximaal. Warmte: ongekend. Knuffelfactor: off the charts. De wetenschap geeft het op — er is geen schaal voor.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-pink-400">100%</div><div className="mt-1 text-[11px] text-zinc-500">Lievigheidsscore</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-pink-400">0</div><div className="mt-1 text-[11px] text-zinc-500">Seconden twijfel</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-pink-400">∞</div><div className="mt-1 text-[11px] text-zinc-500">Knuffels uitgedeeld</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold text-pink-400">UNANIEM</div><div className="mt-1 text-[11px] text-zinc-500">Jurybesluit</div></div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center max-w-md mx-auto">
              <p className="text-base italic text-zinc-300">&quot;We hadden het onderzoek niet nodig. Maar we hebben het toch gedaan. Gewoon om het officieel te maken.&quot;</p>
              <p className="mt-2 text-xs text-zinc-600">— De hele onderzoekscommissie</p>
            </div>
            <p className="text-xs text-zinc-700 italic">Dit is geen verrassing. Dit is een bevestiging.</p>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Nienke" lang={lang} label="Deel via WhatsApp" siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Nienke" lang={lang} siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Stichting Liefste Onderzoek</p>
          <p className="mt-1 text-[10px] text-zinc-800 italic">Niek begon dit. Nienke maakte het mooi.</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  // Easter egg: Dennis — only on honger site
  if (siteId === "honger" && lowerName === "dennis") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam={naam} />
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-green-400 animate-pulse">
              MACRO&apos;S TRACKED — GAINZ CONFIRMED
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
              Dennis heeft{" "}
              <span className="line-through text-orange-400/50">honger</span>{" "}
              <span className="text-green-400">gains</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 italic -mt-4">Het onderzoek is bijgesteld. Dennis eet niet zomaar — Dennis eet strategisch.</p>
            <div className="space-y-5 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              <p>Waar anderen snacken, voert Dennis een nauwkeurig voedingsplan uit. Elke maaltijd is berekend. Elke macro is geteld. De koelkast is geen zwakte — het is een operatie.</p>
              <p>Ja, Dennis eet veel. Maar het is gedisciplineerd veel. Het verschil tussen honger en bulk is intentie. En Dennis heeft een spreadsheet.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-green-400">2847</div><div className="mt-1 text-[11px] text-zinc-500">Kcal dagdoel</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-green-400">184g</div><div className="mt-1 text-[11px] text-zinc-500">Eiwit per dag</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold font-mono text-green-400">100%</div><div className="mt-1 text-[11px] text-zinc-500">Macro compliance</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold text-green-400">GAINZ</div><div className="mt-1 text-[11px] text-zinc-500">Status: bevestigd</div></div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center max-w-md mx-auto">
              <p className="text-sm font-mono text-zinc-500 mb-3">// macro_log.csv</p>
              <div className="space-y-2 text-sm text-left font-mono">
                <p className="text-zinc-500"><span className="text-green-400">[OK]</span>{" "}Ontbijt: 6 eieren, havermout, banaan ✓</p>
                <p className="text-zinc-500"><span className="text-green-400">[OK]</span>{" "}Lunch: kip, rijst, broccoli ✓</p>
                <p className="text-zinc-500"><span className="text-green-400">[OK]</span>{" "}Snack: kwark met proteïnepoeder ✓</p>
                <p className="text-zinc-500"><span className="text-amber-400">[BULK]</span>{" "}Avond: &quot;nog een beetje extra&quot; → +800 kcal</p>
              </div>
            </div>
            <p className="text-xs text-zinc-700 italic">Dennis heeft geen honger. Dennis heeft een plan. Het plan omvat soms de hele koelkast.</p>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Dennis" lang={lang} label="Deel via WhatsApp" siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Dennis" lang={lang} siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Stichting Verantwoord Eten</p>
          <p className="mt-1 text-[10px] text-zinc-800 italic">Het begon bij Niek. De gains bij Dennis.</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  // Easter egg: Pappa — only on honger site
  if (siteId === "honger" && (lowerName === "pappa" || lowerName === "papa")) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
        <ViewTracker naam="Pappa" />
        <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-950/30 via-transparent to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-orange-400">
              DAD JOKE INGELADEN
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
              Natuurlijk heeft pappa{" "}
              <span className="text-orange-400">honger</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 italic -mt-4">Dit is geen verrassing. Dit is een bevestiging.</p>
            <div className="space-y-5 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              <p>Pappa staat bij de barbecue. Niemand heeft gevraagd of pappa de barbecue wil doen. Maar daar staat pappa. Met een tang. En honger.</p>
              <p>Om 23:00 sluipt pappa naar de koelkast. &quot;Nog even een boterhammetje.&quot; Het worden er drie. Met kaas. Boven het aanrecht. In het donker.</p>
              <p>Dit is geen fase. Dit is vaderschap. <span className="text-orange-400 font-bold text-xl sm:text-2xl">Eat it.</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto pt-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-orange-400">23:00</div><div className="mt-1 text-[11px] text-zinc-500">Koelkast-raids</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-orange-400">∞</div><div className="mt-1 text-[11px] text-zinc-500">BBQ&apos;s geclaimd</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-3xl font-bold text-orange-400">3</div><div className="mt-1 text-[11px] text-zinc-500">Boterhammen &quot;nog eentje&quot;</div></div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"><div className="text-2xl font-bold text-orange-400">ALTIJD</div><div className="mt-1 text-[11px] text-zinc-500">Honger-status</div></div>
            </div>
            <p className="text-xs text-zinc-700 italic">De koelkast is geen snack-station. Het is pappa&apos;s kantoor na 22:00.</p>
            <div className="flex w-full max-w-sm mx-auto flex-col gap-3 pt-4">
              <ShareButton naam="Pappa" lang={lang} label="Deel via WhatsApp" siteId={siteId} />
            </div>
          </div>
        </section>
        <ShareButtons naam="Pappa" lang={lang} siteId={siteId} />
        <footer className="border-t border-zinc-800 py-12 px-6 text-center">
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} Stichting Vaderlijke Honger</p>
          <p className="mt-1 text-[10px] text-zinc-800 italic">Niek had honger. Pappa maakte er een grap van.</p>
          <p className="mt-6 text-xs text-zinc-600">Made by{" "}<a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a></p>
        </footer>
      </div>
    );
  }

  const spice = validateSpice(w);
  const { redenen, statistieken, getuigenissen, faq, tips } = getContent(naam, lang, siteId);
  const ui = getUI(lang, siteId);
  const lines = getSpiceLines(naam, spice, lang, siteId);
  const customSubtitle = getCustomSubtitle(naam, siteId);

  // Use site accent color for highlight
  const accentColor = site.accentColor;
  const isPositive = siteId === "liefste"; // positive sites use different emoji/tone

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <ViewTracker naam={naam} />
      {site.hasEnglish && <LanguageToggle lang={lang} />}

      {/* Hero */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent" style={siteId !== "grappig" ? { background: `linear-gradient(to bottom, ${accentColor}15, transparent, transparent)` } : undefined} />
        <div className="absolute top-20 sm:top-8 left-0 right-0 z-10 flex justify-center">
          <TopShared lang={lang} />
        </div>
        <div className="relative z-10 animate-fade-in-up">
          <p className="mb-4 text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            {ui.hero.subtitle}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-7xl md:text-8xl landscape:text-3xl landscape:sm:text-5xl">
            {naam} {ui.hero.before}{" "}
            <span className="animate-pulse-red font-black" style={siteId !== "grappig" ? { color: accentColor } : undefined}>{ui.hero.highlight}</span>{" "}
            {ui.hero.after}
          </h1>
          {customSubtitle && (
            <p className="mt-2 text-sm sm:text-base text-zinc-500 italic">
              {customSubtitle}
            </p>
          )}
          <p className="mt-6 max-w-xl mx-auto text-lg text-zinc-400 leading-relaxed">
            {ui.hero.description}
          </p>
          <div className="mt-10 flex w-full max-w-sm mx-auto flex-col gap-3">
            <a
              href="#bewijs"
              className="block w-full rounded-full border border-zinc-700 px-8 py-3 text-center text-sm font-medium transition-all hover:bg-white hover:text-black hover:border-white"
            >
              {ui.hero.cta}
            </a>
            <ShareButton
              naam={naam}
              lang={lang}
              label={ui.share.shareButton()}
              groupId={groupId || undefined}
              siteId={siteId}
            />
          </div>
          <GroupCheck lang={lang} currentNaam={naam} compact siteId={siteId} />
        </div>
        <div className="absolute bottom-10 animate-bounce text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Verdict */}
      <section className="border-t border-zinc-800 py-16 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-3">
            <p className="text-sm font-mono uppercase tracking-widest text-zinc-500">{lines.opening}</p>
            <p className="text-2xl font-bold sm:text-3xl">{lines.verdict}</p>
            <p className="text-zinc-400">{lines.context}</p>
            {lines.stat && (
              <p className="text-sm font-mono" style={{ color: accentColor }}>{lines.stat}</p>
            )}
            <p className="text-sm text-zinc-500 pt-2">{lines.closing}</p>
          </div>
        </div>
      </section>

      {/* Statistieken */}
      <section className="border-t border-zinc-800 bg-zinc-950/50 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">{ui.stats.heading}</h2>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {statistieken.map((stat, i) => (
              <div key={i} className="animate-counter text-center" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-4xl font-black sm:text-5xl" style={{ color: accentColor }}>{stat.waarde}</div>
                <div className="mt-2 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redenen */}
      <section id="bewijs" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">{ui.reasons.heading}</h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">{ui.reasons.subheading(naam)}</h3>
          <div className="mt-16 space-y-12">
            {redenen.map((reden, i) => (
              <div key={i} className="animate-slide-in group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-zinc-600 hover:bg-zinc-900" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>{i + 1}</span>
                  <div>
                    <h4 className="text-xl font-semibold">{reden.titel}</h4>
                    <p className="mt-3 text-zinc-400 leading-relaxed">{reden.tekst}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getuigenissen */}
      <section className="border-t border-zinc-800 bg-zinc-950/50 py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">{ui.testimonials.heading}</h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">{ui.testimonials.subheading}</h3>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {getuigenissen.map((getuigenis, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-600">
                <svg className="mb-4 h-8 w-8 text-zinc-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-zinc-300 italic leading-relaxed">&ldquo;{getuigenis.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-medium text-zinc-500">&mdash; {getuigenis.auteur}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">{ui.faqSection.heading}</h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">{ui.faqSection.subheading}</h3>
          <div className="mt-16 space-y-6">
            {faq.map((item, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h4 className="font-semibold">{item.vraag}</h4>
                <p className="mt-2 text-zinc-400">{item.antwoord}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      {tips && tips.length > 0 && (
        <section className="border-t border-zinc-800 bg-zinc-950/50 py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">{ui.tipsSection.heading}</h2>
            <h3 className="text-center text-3xl font-bold sm:text-4xl">{ui.tipsSection.subheading}</h3>
            <div className="mt-12 space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-600">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>{i + 1}</span>
                  <p className="text-zinc-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Battle check - bottom */}
      <section className="border-t border-zinc-800 py-12 px-6 text-center">
        <GroupCheck lang={lang} currentNaam={naam} siteId={siteId} />
      </section>

      {/* CTA */}
      <ShareButtons naam={naam} lang={lang} groupId={groupId || undefined} siteId={siteId} />

      {/* Cross-site discovery */}
      <SiteDiscovery naam={naam} lang={lang} siteId={siteId} />

      {/* Suggestion box */}
      <SuggestBox
        naam={naam}
        siteId={siteId}
        accentColor={accentColor}
        heading={ui.suggestBox.heading}
        placeholder={ui.suggestBox.placeholder(naam)}
        button={ui.suggestBox.button}
        success={ui.suggestBox.success}
        countLabel={ui.suggestBox.countLabel}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6 text-center">
        <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} {ui.footer.stichting()}</p>
        <p className="mt-2 text-xs text-zinc-700">{ui.footer.disclaimer(naam)}</p>
        <p className="mt-1 text-[10px] text-zinc-800 italic">
          {siteId === "grappig" && "Where it all satisfyingly began: Niek."}
          {siteId === "honger" && "Niek at als eerste. De rest volgde."}
          {siteId === "werken" && "Niek werkte ook niet. Toen begon dit."}
          {siteId === "liefste" && "Niek was niet de liefste. Daarom bestaat deze site."}
          {siteId === "lief" && "Niek deed niet ff lief. Dus moest iemand het zeggen."}
        </p>
        <p className="mt-6 text-xs text-zinc-600">
          Made by{" "}
          <a href="https://www.pinkpollos.com/nl/lab" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white">Pink Pollos</a>
        </p>
      </footer>
    </div>
  );
}
