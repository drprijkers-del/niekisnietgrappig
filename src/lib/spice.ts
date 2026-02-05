import { Lang } from "./content";
import { hashString, seededRng } from "./utils";

export interface SpiceLines {
  opening: string;
  verdict: string;
  context: string;
  stat: string | null;
  closing: string;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

const nl = {
  openings: [
    "Breaking news uit het humor-laboratorium.",
    "Na uitgebreid onderzoek kunnen we bevestigen:",
    "De resultaten zijn binnen en het is erger dan verwacht.",
    "Lieve aanwezigen, we moeten praten.",
    "Het onderzoek is afgerond. Ga zitten.",
    "Dit is geen grap. Ironisch genoeg.",
    "Spoiler: het wordt niet beter.",
    "De wetenschap liegt niet, in tegenstelling tot je beleefdheids-lach.",
    "Je voelde het al aankomen.",
    "Wij hebben het onderzocht zodat jij het niet hoeft te doen.",
  ],
  verdicts: [
    "Het is officieel: {naam} is niet grappig.",
    "{naam} vertelde een grap. Niemand lachte. Business as usual.",
    "Als humor een sport was, zat {naam} op de bank.",
    "{naam} en grappig zijn? Twee werelden die nooit botsen.",
    "Wetenschappers bevestigen: {naam} is allergisch voor humor.",
    "{naam} is zo ongrappig dat het bijna weer grappig is. Bijna.",
    "Siri, zoek: 'is {naam} grappig?' Resultaat: nee.",
    "{naam} mist timing, creativiteit, en een punchline. Verder prima.",
    "Ergens in een parallel universum is {naam} grappig. Niet hier.",
    "{naam}: de reden dat mensen beleefd lachen uitvonden.",
  ],
  contextWith: [
    "{naam}'s {w}-grappen? Zelfs de muren willen weg.",
    "De {w}-humor van {naam} is als wifi in de kelder: geen verbinding.",
    "{naam} denkt grappig te zijn over {w}. {naam} denkt veel.",
    "Als {w} een comedy show was, zou {naam} het publiek zijn dat vertrekt.",
    "{naam}'s {w}-moppen zijn zo droog, de Sahara is jaloers.",
    "Misschien moet {naam} zich focussen op {w} in plaats van grappen.",
    "Over {w} heeft {naam} precies één grap. En die is niet grappig.",
    "Zelfs Google heeft geen resultaten voor '{naam} grappig {w}'.",
    "{naam}'s {w}-humor compileert niet eens.",
    "De {w}-grappen van {naam} verdienen een eigen waarschuwingslabel.",
  ],
  contextWithout: [
    "Het maakt niet uit over welk onderwerp: altijd mis.",
    "In élke situatie even pijnlijk. Consistent, dat wel.",
    "Geen enkel onderwerp is veilig.",
    "Of het nu over werk gaat, sport, of het weer: niet grappig.",
    "De stilte na een grap is oorverdovend.",
    "In elk gesprek dezelfde energie: cringe.",
    "De humor-woestijn kent geen grenzen.",
    "Het maakt niet uit of er publiek is of niet. Het helpt niet.",
    "Zelfs de koffiemachine zucht als er een grap aankomt.",
    "Het is structureel. Niet incidenteel. Structureel.",
  ],
  fakeStats: [
    "Gemiddelde reactietijd na een grap: 4,7 seconden ongemakkelijke stilte.",
    "9 van de 10 vrienden doen alsof ze moeten hoesten.",
    "Aantal grappen verteld vandaag: 12. Aantal grappige: 0.",
    "Het nep-lach-percentage in de directe omgeving: 97%.",
    "Humor-score op een schaal van 1-10: toast.",
    "Laatste keer dat iemand écht lachte: foutmelding.",
    "Grappen per uur: 6. Waarschuwingen per uur: ook 6.",
    "De cringe-index staat op: gevaarlijk hoog.",
    "Percentage grappen met een echte punchline: 3%.",
    "Wetenschappelijke classificatie: humor-deficiëntie graad 3.",
  ],
  closings: [
    "Deel dit voordat {naam} weer een grap vertelt.",
    "Stuur dit naar iemand die het moet horen.",
    "De waarheid doet pijn. Net als de grappen.",
    "Je kunt nu verder met je leven. Het wordt beter.",
    "Dit was een publieke dienstaankondiging.",
    "{naam} verspreidt al genoeg slechte grappen. Verspreid jij de waarheid.",
    "Als je gelachen hebt om deze pagina, ben je al grappiger dan {naam}.",
    "Wie je ook bent: {naam} moet betere grappen leren maken.",
    "Bewaar deze link voor het volgende ongemakkelijke moment.",
    "De wetenschap heeft gesproken. En ja, dat was grappiger dan {naam}.",
  ],
};

const en = {
  openings: [
    "Breaking news from the humor laboratory.",
    "After extensive research, we can confirm:",
    "The results are in and it's worse than expected.",
    "Dear audience, we need to talk.",
    "The study is complete. Please sit down.",
    "This is not a joke. Ironically.",
    "Spoiler: it doesn't get better.",
    "Science doesn't lie, unlike your polite laugh.",
    "You saw this coming.",
    "We investigated so you don't have to.",
  ],
  verdicts: [
    "It's official: {naam} is not funny.",
    "{naam} told a joke. Nobody laughed. Business as usual.",
    "If humor were a sport, {naam} would be on the bench.",
    "{naam} and being funny? Two worlds that never collide.",
    "Scientists confirm: {naam} is allergic to humor.",
    "{naam} is so unfunny it's almost funny again. Almost.",
    "Siri, search: 'is {naam} funny?' Result: no.",
    "{naam} lacks timing, creativity, and a punchline. Otherwise fine.",
    "Somewhere in a parallel universe, {naam} is funny. Not here.",
    "{naam}: the reason people invented the polite laugh.",
  ],
  contextWith: [
    "{naam}'s {w} jokes? Even the walls want to leave.",
    "{naam}'s {w} humor is like Wi-Fi in a basement: no connection.",
    "{naam} thinks they're funny about {w}. {naam} thinks a lot of things.",
    "If {w} were a comedy show, {naam} would be the audience that leaves.",
    "{naam}'s {w} jokes are so dry, the Sahara is jealous.",
    "Maybe {naam} should focus on {w} instead of comedy.",
    "{naam} has exactly one {w} joke. It's not funny.",
    "Even Google has no results for '{naam} funny {w}'.",
    "{naam}'s {w} humor doesn't even compile.",
    "{naam}'s {w} jokes deserve their own warning label.",
  ],
  contextWithout: [
    "No matter the topic: always a miss.",
    "In every situation, equally painful. Consistent, at least.",
    "No subject is safe.",
    "Whether it's about work, sports, or the weather: not funny.",
    "The silence after a joke is deafening.",
    "In every conversation, the same energy: cringe.",
    "The humor desert knows no boundaries.",
    "It doesn't matter if there's an audience or not. It doesn't help.",
    "Even the coffee machine sighs when a joke is coming.",
    "It's structural. Not incidental. Structural.",
  ],
  fakeStats: [
    "Average reaction time after a joke: 4.7 seconds of awkward silence.",
    "9 out of 10 friends pretend they need to cough.",
    "Jokes told today: 12. Funny ones: 0.",
    "Fake laugh percentage in the vicinity: 97%.",
    "Humor score on a scale of 1-10: toast.",
    "Last time someone genuinely laughed: error not found.",
    "Jokes per hour: 6. Warnings per hour: also 6.",
    "The cringe index reads: dangerously high.",
    "Percentage of jokes with an actual punchline: 3%.",
    "Scientific classification: humor deficiency grade 3.",
  ],
  closings: [
    "Share this before {naam} tells another joke.",
    "Send this to someone who needs to hear it.",
    "The truth hurts. So do the jokes.",
    "You can go on with your life now. It gets better.",
    "This has been a public service announcement.",
    "{naam} already spreads enough bad jokes. You spread the truth.",
    "If you laughed at this page, you're already funnier than {naam}.",
    "Whoever you are: {naam} needs to learn better jokes.",
    "Save this link for the next awkward moment.",
    "Science has spoken. And yes, that was funnier than {naam}.",
  ],
};

const templates = { nl, en };

export function getSpiceLines(
  naam: string,
  spice: string | null,
  lang: Lang
): SpiceLines {
  const seed = hashString(`${naam}|${spice || ""}|${lang}`);
  const rng = seededRng(seed);

  const t = templates[lang];

  const opening = pick(t.openings, rng);
  const verdict = pick(t.verdicts, rng)
    .replace(/\{naam\}/g, naam);

  let context: string;
  if (spice) {
    context = pick(t.contextWith, rng)
      .replace(/\{naam\}/g, naam)
      .replace(/\{w\}/g, spice);
  } else {
    context = pick(t.contextWithout, rng);
  }

  const stat = rng() > 0.3 ? pick(t.fakeStats, rng) : null;
  const closing = pick(t.closings, rng)
    .replace(/\{naam\}/g, naam);

  return { opening, verdict, context, stat, closing };
}
