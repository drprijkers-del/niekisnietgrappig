import { Lang } from "./content";
import { SiteId, SITES } from "./sites";
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

type SpiceTemplates = {
  openings: string[];
  verdicts: string[];
  contextWith: string[];
  contextWithout: string[];
  fakeStats: string[];
  closings: string[];
};

const nl: SpiceTemplates = {
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

const en: SpiceTemplates = {
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

// Site-specific spice templates for non-grappig sites
const siteSpice: Partial<Record<string, Partial<SpiceTemplates>>> = {
  knor: {
    openings: [
      "Breaking news vanuit het verenigingsbestuur.",
      "Na uitgebreid ledenonderzoek kunnen we bevestigen:",
      "De resultaten zijn binnen. Het lidmaatschap is afgewezen.",
      "Lieve aanwezigen, de ballen gaan niet.",
      "Het onderzoek is afgerond. De deur blijft dicht.",
      "Dit is geen ontgroening. Ironisch genoeg.",
      "Spoiler: het wordt geen lid.",
      "De administratie liegt niet, in tegenstelling tot dat aanmeldformulier.",
      "Je voelde het al aankomen. Net als de afwijzing.",
      "Wij hebben het onderzocht zodat het bestuur het niet hoeft te doen.",
    ],
    verdicts: [
      "Het is officieel: {naam} is een knor.",
      "{naam} stond bij de deur. De deur bleef dicht.",
      "Als lidmaatschap een sport was, stond {naam} niet eens op de reservebank.",
      "{naam} en lid worden? Twee werelden die nooit botsen.",
      "Het bestuur bevestigt: {naam} is allergisch voor aanmeldformulieren.",
      "{naam} is zo knor dat het bijna een statement is. Bijna.",
      "{naam}: de reden dat ze 'niet-lid' als categorie uitvonden.",
    ],
    contextWith: [
      "{naam}'s {w}-activiteiten? Zelfs de borrelcommissie wil weg.",
      "De {w}-betrokkenheid van {naam} is als wifi in de kelder: geen verbinding.",
      "{naam} denkt mee te doen over {w}. {naam} denkt veel.",
      "Als {w} een commissie was, zou {naam} niet eens op de mailinglijst staan.",
      "{naam}'s {w}-bijdrage is zo droog, de bestuurskamer is jaloers.",
      "Misschien moet {naam} zich focussen op {w} in plaats van lid proberen te worden.",
      "Over {w} heeft {naam} precies één mening. En die telt niet.",
      "Zelfs Google heeft geen resultaten voor '{naam} lid {w}'.",
      "{naam}'s {w}-kennis compileert niet eens.",
      "De {w}-inzet van {naam} verdient een eigen afwijzingsbrief.",
    ],
    contextWithout: [
      "Het maakt niet uit bij welke vereniging: altijd afgewezen.",
      "In élke sociëteit even ongewenst. Consistent, dat wel.",
      "Geen enkel dispuut is veilig.",
      "Of het nu gaat om borrels, commissies, of het ALV: niet welkom.",
      "De stilte na een aanmelding is oorverdovend.",
      "In elk gezelschap dezelfde energie: afwijzing.",
      "De knor-woestijn kent geen grenzen.",
      "Het maakt niet uit of er een introweek is of niet. Het helpt niet.",
      "Zelfs de bierpomp zucht als {naam} binnenloopt.",
      "Het is structureel. Niet incidenteel. Structureel.",
    ],
    fakeStats: [
      "Gemiddelde wachttijd bij de deur: 4,7 uur. Daarna alsnog afgewezen.",
      "9 van de 10 bestuursleden doen alsof ze moeten vergaderen.",
      "Aanmeldingen vandaag: 12. Goedgekeurde: 0.",
      "Het nep-welkom-percentage in de sociëteit: 97%.",
      "Lidmaatschapsscore op een schaal van 1-10: knor.",
      "Laatste keer dat {naam} ergens lid werd: foutmelding.",
      "Aanmeldpogingen per maand: 6. Afwijzingen per maand: ook 6.",
      "De cringe-index bij binnenkomst: gevaarlijk hoog.",
      "Percentage kans op lidmaatschap: 3%.",
      "Wetenschappelijke classificatie: knor-deficiëntie graad 3.",
    ],
    closings: [
      "Deel dit voordat {naam} weer een aanmelding doet.",
      "Stuur dit naar iemand die het moet horen.",
      "De waarheid doet pijn. Net als die afwijzing.",
      "Je kunt nu verder met je leven. Zonder {naam} als lid.",
      "Dit was een publieke dienstaankondiging van het bestuur.",
      "{naam} verspreidt al genoeg aanmeldingen. Verspreid jij de waarheid.",
      "Als je gelachen hebt om deze pagina, ben je al socialer dan {naam}.",
      "Wie je ook bent: {naam} moet stoppen met aanmelden.",
      "Bewaar deze link voor de volgende aanmeldpoging.",
      "Het bestuur heeft gesproken. De deur blijft dicht.",
    ],
  },
  honger: {
    openings: [
      "Breaking news uit de keuken.",
      "Na uitgebreid voedingsonderzoek kunnen we bevestigen:",
      "De resultaten zijn binnen. De koelkast is leeg.",
      "Lieve aanwezigen, het eten is op.",
      "Het onderzoek is afgerond. De bezorgapp staat open.",
      "Dit is geen menu. Helaas.",
      "Spoiler: er is geen toetje.",
      "De weegschaal liegt niet, in tegenstelling tot 'ik heb al gegeten'.",
      "Je voelde het al aankomen. Net als die maagknor.",
      "Wij hebben het onderzocht zodat de kok het niet hoeft te doen.",
    ],
    verdicts: [
      "Het is officieel: {naam} heeft honger. Altijd. Nu ook.",
      "{naam} at een driegangenmenu en vroeg of er een vierde gang was.",
      "De koelkast zag {naam} aankomen en begon te trillen.",
      "{naam} en vol zijn? Twee werelden die nooit botsen.",
      "De maag van {naam} is officieel geclassificeerd als zwart gat.",
      "{naam}: de reden dat restaurants 'all you can eat' heroverwegen.",
    ],
    contextWith: [
      "{naam} bij de {w}? De voorraad was binnen 3 minuten op.",
      "De {w}-consumptie van {naam} is als een zwart gat: alles verdwijnt.",
      "{naam} denkt genoeg te hebben gegeten van {w}. {naam} denkt veel.",
      "Als {w} een buffet was, zou {naam} de reden zijn dat het sluit.",
      "{naam}'s {w}-portie is zo groot, de Sahara is jaloers op de droogte erna.",
      "Misschien moet {naam} zich focussen op {w} in plaats van nóg een portie.",
      "Over {w} heeft {naam} precies één mening: meer.",
      "Zelfs Google heeft geen resultaten voor '{naam} vol na {w}'.",
      "{naam}'s {w}-eetpatroon breekt alle records.",
      "De {w}-voorraad van {naam} verdient een eigen opslagloods.",
    ],
    contextWithout: [
      "Het maakt niet uit welk gerecht: altijd honger.",
      "In élke situatie even uitgehongerd. Consistent, dat wel.",
      "Geen enkel menu is genoeg.",
      "Of het nu ontbijt is, lunch, of diner: nog steeds honger.",
      "De stilte na het eten duurt precies 3 seconden.",
      "In elk restaurant dezelfde energie: nabestellen.",
      "De honger-woestijn kent geen grenzen.",
      "Het maakt niet uit of er een buffet is of niet. Het is nooit genoeg.",
      "Zelfs de magnetron zucht als {naam} weer binnenloopt.",
      "Het is structureel. Niet incidenteel. Structureel.",
    ],
    fakeStats: [
      "Gemiddelde tijd tussen maaltijden: 47 minuten.",
      "9 van de 10 koelkasten sluiten zichzelf af.",
      "Maaltijden vandaag: 12. Genoeg gehad: 0 keer.",
      "Het 'ik heb net gegeten'-leugenpercentage: 97%.",
      "Verzadigingsscore op een schaal van 1-10: toast. Opgegeten.",
      "Laatste keer dat {naam} echt vol was: foutmelding.",
      "Snacks per uur: 6. Maaltijden per uur: ook 6.",
      "De honger-index staat op: gevaarlijk hoog.",
      "Percentage maaltijden zonder nabestelling: 3%.",
      "Wetenschappelijke classificatie: honger-deficiëntie graad 3.",
    ],
    closings: [
      "Deel dit voordat {naam} weer de koelkast opent.",
      "Stuur dit naar iemand die het moet horen.",
      "De waarheid doet pijn. Net als die lege maag.",
      "Je kunt nu verder met je leven. {naam} gaat verder met eten.",
      "Dit was een culinaire noodmelding.",
      "{naam} eet al genoeg. Verspreid jij de waarheid.",
      "Als je gelachen hebt om deze pagina, heb je in elk geval geen honger.",
      "Wie je ook bent: verstop je eten voor {naam}.",
      "Bewaar deze link voor de volgende keer dat {naam} 'trek' heeft.",
      "De wetenschap heeft gesproken. De koelkast ook. Allebei leeg.",
    ],
  },
  werken: {
    openings: [
      "Breaking news vanuit de bank.",
      "Na uitgebreid productiviteitsonderzoek kunnen we bevestigen:",
      "De resultaten zijn binnen. Er is niks gedaan.",
      "Lieve aanwezigen, het is weer maandag. Voor sommigen maakt dat niks uit.",
      "Het onderzoek is afgerond. Netflix staat nog aan.",
      "Dit is geen pauze. Dit is de hele dag.",
      "Spoiler: morgen wordt het ook niks.",
      "De wekker liegt niet, in tegenstelling tot 'ik ga zo beginnen'.",
      "Je voelde het al aankomen. Net als die deadline.",
      "Wij hebben het onderzocht zodat de baas het niet hoeft te doen.",
    ],
    verdicts: [
      "Het is officieel: {naam} moet eens gaan werken.",
      "{naam} lag op de bank. Weer. Al de hele dag. Structureel.",
      "De snooze-knop van {naam} heeft een burnout.",
      "{naam} en werken? Twee werelden die nooit botsen.",
      "LinkedIn bevestigt: {naam} is allergisch voor deadlines.",
      "{naam}: de reden dat HR overuren draait.",
    ],
    contextWith: [
      "{naam} en {w}? De enige activiteit was niksen.",
      "De {w}-productiviteit van {naam} is als wifi in de kelder: geen verbinding.",
      "{naam} denkt hard te werken aan {w}. {naam} denkt veel. Doet weinig.",
      "Als {w} een baan was, was {naam} al 3x ontslagen.",
      "{naam}'s {w}-inzet is zo droog, de woestijn is jaloers.",
      "Misschien moet {naam} zich focussen op {w} in plaats van scrollen.",
      "Over {w} heeft {naam} precies één plan: morgen.",
      "Zelfs Google heeft geen resultaten voor '{naam} productief {w}'.",
      "{naam}'s {w}-werkhouding compileert niet eens.",
      "De {w}-prestaties van {naam} verdienen een eigen functioneringsgesprek.",
    ],
    contextWithout: [
      "Het maakt niet uit welke taak: altijd uitgesteld.",
      "In élke situatie even improductief. Consistent, dat wel.",
      "Geen enkele deadline is veilig.",
      "Of het nu om werk gaat, studie, of huishouden: niks gedaan.",
      "De stilte na 'ga je nog beginnen?' is oorverdovend.",
      "In elk project dezelfde energie: uitstel.",
      "De productiviteits-woestijn kent geen grenzen.",
      "Het maakt niet uit of er een deadline is of niet. Het helpt niet.",
      "Zelfs de laptop zucht als {naam} 'm openklapt. Om Netflix te kijken.",
      "Het is structureel. Niet incidenteel. Structureel.",
    ],
    fakeStats: [
      "Gemiddelde werktijd per dag: 4,7 minuten. Inclusief koffiepauze.",
      "9 van de 10 collega's doen alsof ze het niet zien.",
      "To-do's vandaag: 12. Afgerond: 0.",
      "Het 'ik ben ermee bezig'-leugenpercentage: 97%.",
      "Productiviteitsscore op een schaal van 1-10: pauze.",
      "Laatste keer dat er écht gewerkt werd: foutmelding.",
      "Excuses per uur: 6. Taken per uur: 0.",
      "De uitstel-index staat op: gevaarlijk hoog.",
      "Percentage taken op tijd af: 3%.",
      "Wetenschappelijke classificatie: werk-deficiëntie graad 3.",
    ],
    closings: [
      "Deel dit voordat {naam} weer een serie begint.",
      "Stuur dit naar iemand die het moet horen.",
      "De waarheid doet pijn. Net als die gemiste deadline.",
      "Je kunt nu verder met je leven. {naam} gaat verder met niksen.",
      "Dit was een professionele interventie.",
      "{naam} stelt al genoeg uit. Verspreid jij de waarheid.",
      "Als je dit hebt gelezen, heb je al meer gedaan dan {naam} vandaag.",
      "Wie je ook bent: {naam} moet eens aan de slag.",
      "Bewaar deze link voor het volgende functioneringsgesprek.",
      "De wetenschap heeft gesproken. {naam}'s to-do-lijst huilt.",
    ],
  },
  werken_en: {
    openings: [
      "Breaking news from the couch.",
      "After extensive productivity research, we can confirm:",
      "The results are in. Nothing was done.",
      "Dear audience, it's Monday again. For some, that changes nothing.",
      "The study is complete. Netflix is still on.",
      "This is not a break. This is the whole day.",
      "Spoiler: tomorrow won't be better either.",
      "The alarm doesn't lie, unlike 'I'll start in a minute'.",
      "You saw this coming. So did the deadline.",
      "We investigated so the boss doesn't have to.",
    ],
    verdicts: [
      "It's official: {naam} should be working.",
      "{naam} was on the couch. Again. All day. Structurally.",
      "{naam}'s snooze button has filed for a burnout.",
      "{naam} and working? Two worlds that never collide.",
      "LinkedIn confirms: {naam} is allergic to deadlines.",
      "{naam}: the reason HR works overtime.",
    ],
    contextWith: [
      "{naam} and {w}? The only activity was doing nothing.",
      "{naam}'s {w} productivity is like Wi-Fi in a basement: no connection.",
      "{naam} thinks they're working hard on {w}. {naam} thinks a lot. Does little.",
      "If {w} were a job, {naam} would've been fired three times already.",
      "{naam}'s {w} effort is so dry, the desert is jealous.",
      "Maybe {naam} should focus on {w} instead of scrolling.",
      "{naam} has exactly one plan for {w}: tomorrow.",
      "Even Google has no results for '{naam} productive {w}'.",
      "{naam}'s {w} work ethic doesn't even compile.",
      "{naam}'s {w} performance deserves its own performance review.",
    ],
    contextWithout: [
      "No matter the task: always postponed.",
      "In every situation, equally unproductive. Consistent, at least.",
      "No deadline is safe.",
      "Whether it's work, study, or chores: nothing done.",
      "The silence after 'are you going to start?' is deafening.",
      "In every project, the same energy: procrastination.",
      "The productivity desert knows no boundaries.",
      "It doesn't matter if there's a deadline or not. It doesn't help.",
      "Even the laptop sighs when {naam} opens it. To watch Netflix.",
      "It's structural. Not incidental. Structural.",
    ],
    fakeStats: [
      "Average work time per day: 4.7 minutes. Including coffee break.",
      "9 out of 10 colleagues pretend they don't notice.",
      "To-dos today: 12. Completed: 0.",
      "The 'I'm working on it' lie percentage: 97%.",
      "Productivity score on a scale of 1-10: break.",
      "Last time actual work was done: error not found.",
      "Excuses per hour: 6. Tasks per hour: 0.",
      "The procrastination index reads: dangerously high.",
      "Percentage of tasks completed on time: 3%.",
      "Scientific classification: work deficiency grade 3.",
    ],
    closings: [
      "Share this before {naam} starts another series.",
      "Send this to someone who needs to hear it.",
      "The truth hurts. So does that missed deadline.",
      "You can go on with your life now. {naam} will continue doing nothing.",
      "This has been a professional intervention.",
      "{naam} already procrastinates enough. You spread the truth.",
      "If you read this, you've already done more than {naam} today.",
      "Whoever you are: {naam} needs to get to work.",
      "Save this link for the next performance review.",
      "Science has spoken. {naam}'s to-do list is crying.",
    ],
  },
  liefste: {
    openings: [
      "Breaking news uit het liefde-laboratorium.",
      "Na uitgebreid onderzoek kunnen we bevestigen:",
      "De resultaten zijn binnen en het is mooier dan verwacht.",
      "Lieve aanwezigen, maak je tissues klaar.",
      "Het onderzoek is afgerond. Bereid je voor op warmte.",
      "Dit is geen sprookje. Maar het voelt er wel zo.",
      "Spoiler: het wordt alleen maar liever.",
      "De wetenschap liegt niet. Dit keer is het goed nieuws.",
      "Je voelde het al aankomen. Die warmte.",
      "Wij hebben het onderzocht en het resultaat is hartverwarmend.",
    ],
    verdicts: [
      "Het is officieel: {naam} is de liefste. Altijd al geweest.",
      "{naam} liep een kamer in. Iedereen voelde zich meteen beter.",
      "Als lief zijn een sport was, wint {naam} goud. Elke. Keer.",
      "{naam} en lief zijn? Letterlijk onafscheidelijk.",
      "Wetenschappers bevestigen: {naam} is de liefste mens op aarde.",
      "{naam}: de reden dat de wereld een beetje mooier is.",
    ],
    contextWith: [
      "{naam} en {w}? Iedereen in de buurt smelt.",
      "De {w}-liefheid van {naam} is als zonneschijn in december: zeldzaam en prachtig.",
      "{naam} doet lief over {w}. En het is oprecht. Altijd.",
      "Als {w} een knuffel was, zou {naam} de warmste zijn.",
      "{naam}'s {w}-liefheid is zo groot, zelfs de zon is jaloers.",
      "{naam} maakt {w} beter gewoon door er te zijn.",
      "Over {w} heeft {naam} precies één aanpak: met liefde.",
      "Zelfs Google geeft alleen maar hartjes bij '{naam} lief {w}'.",
      "{naam}'s {w}-energie is puur goud.",
      "De {w}-liefheid van {naam} verdient een eigen award.",
    ],
    contextWithout: [
      "Het maakt niet uit over welk onderwerp: altijd lief.",
      "In élke situatie even hartverwarmend. Consistent, dat wel.",
      "Geen enkel moment is zonder warmte.",
      "Of het nu gaat om vrienden, familie, of vreemden: altijd lief.",
      "De warmte na een ontmoeting met {naam} is voelbaar.",
      "In elk gesprek dezelfde energie: liefde.",
      "De liefheids-oase kent geen grenzen.",
      "Het maakt niet uit of er publiek is of niet. Altijd lief.",
      "Zelfs de koffiemachine glimlacht als {naam} binnenloopt.",
      "Het is structureel. Niet incidenteel. Structureel lief.",
    ],
    fakeStats: [
      "Gemiddelde knuffel-duur: 4,7 seconden langer dan normaal.",
      "9 van de 10 mensen voelen zich beter na contact met {naam}.",
      "Lieve dingen gedaan vandaag: 12. En het is pas ochtend.",
      "Het glimlach-percentage in de directe omgeving: 97%.",
      "Liefheids-score op een schaal van 1-10: oneindig.",
      "Laatste keer dat iemand niet glimlachte bij {naam}: nooit.",
      "Complimenten per uur: 6. Knuffels per uur: ook 6.",
      "De warmte-index staat op: hartverwarmend hoog.",
      "Percentage ontmoetingen met een glimlach: 100%.",
      "Wetenschappelijke classificatie: liefheid graad oneindig.",
    ],
    closings: [
      "Deel dit voordat je vergeet hoe lief {naam} is. (Spoiler: dat vergeet je niet.)",
      "Stuur dit naar {naam}. Die verdient het.",
      "De waarheid is warm. Net als {naam}.",
      "Je kunt nu verder met je leven. Het is een stukje mooier geworden.",
      "Dit was een publieke liefdesverklaring.",
      "{naam} verspreidt al genoeg liefde. Verspreid jij dit bericht.",
      "Als je geglimlacht hebt om deze pagina, bedank {naam}.",
      "Wie je ook bent: {naam} maakt de wereld beter.",
      "Bewaar deze link voor als je een glimlach nodig hebt.",
      "De wetenschap heeft gesproken. {naam} is officieel de liefste.",
    ],
  },
  lief: {
    openings: [
      "Breaking news uit de gedragsanalyse.",
      "Na uitgebreid onderzoek kunnen we bevestigen:",
      "De resultaten zijn binnen. Het is erger dan verwacht.",
      "Lieve aanwezigen, we moeten het over {naam} hebben.",
      "Het onderzoek is afgerond. De omgeving is niet blij.",
      "Dit is geen grap. Dit is een interventie.",
      "Spoiler: lief doen zit er nog niet in.",
      "De omgeving liegt niet, in tegenstelling tot 'sorry, ik zal lief doen'.",
      "Je voelde het al aankomen. Die onvriendelijkheid.",
      "Wij hebben het onderzocht zodat de buren het niet hoeven te doen.",
    ],
    verdicts: [
      "Het is officieel: {naam} moet ff lief doen. Dringend.",
      "{naam} zei goedemorgen. De kamer voelde zich bedreigd.",
      "Als lief doen een sport was, zou {naam} gediskwalificeerd zijn.",
      "{naam} en lief doen? Twee werelden die nooit botsen.",
      "De omgeving bevestigt: {naam} is allergisch voor aardig zijn.",
      "{naam}: de reden dat mensen 'doe ff normaal' zeggen.",
    ],
    contextWith: [
      "{naam} en {w}? De sfeer daalde onmiddellijk.",
      "De {w}-vriendelijkheid van {naam} is als wifi in de kelder: geen verbinding.",
      "{naam} denkt aardig te zijn over {w}. {naam} denkt veel. Mis.",
      "Als {w} een gezelschap was, zou {naam} de reden zijn dat het stopt.",
      "{naam}'s {w}-houding is zo koud, de Noordpool is jaloers.",
      "Misschien moet {naam} ff lief doen over {w} in plaats van chagrijnig.",
      "Over {w} heeft {naam} precies één toon: onaardig.",
      "Zelfs Google heeft geen resultaten voor '{naam} aardig {w}'.",
      "{naam}'s {w}-gedrag is een rode vlag op zich.",
      "De {w}-attitude van {naam} verdient een eigen klachtenlijn.",
    ],
    contextWithout: [
      "Het maakt niet uit over welk onderwerp: altijd onaardig.",
      "In élke situatie even chagrijnig. Consistent, dat wel.",
      "Geen enkel gezelschap is veilig.",
      "Of het nu gaat om vrienden, collega's, of de kat: niet lief.",
      "De stilte na een opmerking van {naam} is ijskoud.",
      "In elk gesprek dezelfde energie: chagrijn.",
      "De onaardigheids-woestijn kent geen grenzen.",
      "Het maakt niet uit of er gezelschap is of niet. Het helpt niet.",
      "Zelfs de kat loopt weg als {naam} binnenkomt.",
      "Het is structureel. Niet incidenteel. Structureel onaardig.",
    ],
    fakeStats: [
      "Gemiddelde reactietijd na een opmerking: 4,7 seconden geschokte stilte.",
      "9 van de 10 vrienden doen alsof ze het niet hoorden.",
      "Onaardige opmerkingen vandaag: 12. Lieve dingen: 0.",
      "Het nep-glimlach-percentage in de directe omgeving: 97%.",
      "Aardigheids-score op een schaal van 1-10: min 3.",
      "Laatste keer dat {naam} écht lief deed: foutmelding.",
      "Chagrijnige buien per uur: 6. Complimenten per uur: 0.",
      "De chagrijn-index staat op: gevaarlijk hoog.",
      "Percentage gesprekken zonder zucht: 3%.",
      "Wetenschappelijke classificatie: lief-deficiëntie graad 3.",
    ],
    closings: [
      "Deel dit voordat {naam} weer iets onaardigs zegt.",
      "Stuur dit naar {naam}. Als waarschuwing.",
      "De waarheid doet pijn. Net als die opmerkingen.",
      "Je kunt nu verder met je leven. Op veilige afstand.",
      "Dit was een publieke lief-interventie.",
      "{naam} verspreidt al genoeg chagrijn. Verspreid jij de waarheid.",
      "Als je geglimlacht hebt om deze pagina, kun je al meer dan {naam}.",
      "Wie je ook bent: {naam} moet ff lief gaan doen.",
      "Bewaar deze link voor de volgende keer dat {naam} weer chagrijnig is.",
      "De wetenschap heeft gesproken. {naam}, doe. ff. lief.",
    ],
  },
};

// Valentine's Day easter egg templates (when spice = "valentijn" / "valentine")
const valentineNl = {
  openings: [
    "Breaking news uit het liefdeslab.",
    "Na uitgebreid valentijnsonderzoek:",
    "De resultaten zijn binnen. Cupido heeft geschoten.",
    "Alert: Valentijnsdag gedetecteerd.",
    "Het hart heeft gesproken. Luister goed.",
  ],
  verdicts: [
    "Het is officieel: iemand is verliefd op {naam}.",
    "Cupido mikte op {naam}. En raakte. Vol.",
    "{naam} + Valentijnsdag = het wordt wat.",
    "{naam}'s hart klopt. Harder dan normaal. Veel harder.",
    "Ergens kijkt iemand naar {naam} en denkt: die.",
  ],
  contexts: [
    "De chocolade is al besteld. De rozen staan klaar. {naam} weet nog van niks.",
    "Ergens checkt iemand {naam}'s profiel. Al voor de derde keer vandaag.",
    "Valentijnsdag zonder {naam}? Ondenkbaar. Zeg het gewoon.",
    "De hartjes vliegen door de lucht. Ze zijn voor {naam}. Allemaal.",
    "{naam} deed alsof Valentijnsdag niks voorstelt. {naam} liegt.",
  ],
  stats: [
    "Hartslag bij het zien van een berichtje: 147 bpm.",
    "Aantal keer naar telefoon gekeken: 84. Het is pas 10:00.",
    "Kans op een Valentijnsbericht: hoger dan je denkt.",
    "Rode rozen besteld vandaag: 1 miljoen. Eén is voor {naam}.",
    "Chocoladeconsumptie op Valentijnsdag: onbeperkt.",
  ],
  closings: [
    "Stuur dit naar je valentijn. Of naar degene die het moet worden.",
    "Cupido heeft gesproken. De rest is aan jou.",
    "Happy Valentine's Day. Stuur dit door.",
    "De liefde wacht niet. Deze link ook niet.",
    "Deel dit met iemand van wie je hart sneller gaat kloppen.",
  ],
};

const valentineEn = {
  openings: [
    "Breaking news from the love laboratory.",
    "After extensive Valentine's research:",
    "The results are in. Cupid has struck.",
    "Alert: Valentine's Day detected.",
    "The heart has spoken. Listen carefully.",
  ],
  verdicts: [
    "It's official: someone has a crush on {naam}.",
    "Cupid aimed at {naam}. And hit. Hard.",
    "{naam} + Valentine's Day = something's happening.",
    "{naam}'s heart is beating. Faster than usual. Much faster.",
    "Somewhere, someone is looking at {naam} and thinking: that one.",
  ],
  contexts: [
    "The chocolate has been ordered. The roses are ready. {naam} has no idea.",
    "Someone is checking {naam}'s profile. For the third time today.",
    "Valentine's Day without {naam}? Unthinkable. Just say it.",
    "Hearts are flying through the air. They're all for {naam}.",
    "{naam} pretended Valentine's Day doesn't matter. {naam} is lying.",
  ],
  stats: [
    "Heart rate when seeing a text notification: 147 bpm.",
    "Times phone was checked: 84. It's only 10 AM.",
    "Chance of getting a Valentine's message: higher than you think.",
    "Red roses ordered today: 1 million. One is for {naam}.",
    "Chocolate consumption on Valentine's Day: unlimited.",
  ],
  closings: [
    "Send this to your valentine. Or to the one who should be.",
    "Cupid has spoken. The rest is up to you.",
    "Happy Valentine's Day. Now share this.",
    "Love doesn't wait. Neither does this link.",
    "Share this with someone who makes your heart beat faster.",
  ],
};

// Site-specific spice templates for carnaval sites
const prinsSiteSpice: Partial<SpiceTemplates> = {
  openings: [
    "Breaking news vanuit de carnavalsoptocht.",
    "Na uitgebreid kroningsonderzoek kunnen we bevestigen:",
    "De resultaten zijn binnen. De kroon is nep.",
    "Lieve carnavalsvierders, de prins is een bedrieger.",
    "Het onderzoek is afgerond. Ga zitten. Nee, niet op de troon.",
    "Dit is geen carnavalsgrap. Ironisch genoeg.",
    "Spoiler: de kroon past niet.",
    "De raad van elf liegt niet, in tegenstelling tot die prinsentitel.",
    "Je voelde het al aankomen. Die neppe kroon.",
    "Wij hebben het onderzocht zodat het carnavalsvolk het niet hoeft te doen.",
  ],
  verdicts: [
    "Het is officieel: {naam} is geen echte prins.",
    "{naam} droeg een kroon. Niemand boog. Business as usual.",
    "Als carnaval een koninkrijk was, was {naam} verbannen.",
    "{naam} en een echte prins zijn? Twee werelden die nooit botsen.",
    "De raad van elf bevestigt: {naam} is allergisch voor prinselijk gedrag.",
    "{naam} is zo nep dat het bijna weer echt is. Bijna.",
    "{naam}: de reden dat ze kronen met een ketting vastmaken.",
  ],
  contextWith: [
    "{naam}'s {w}-prins-gedrag? Zelfs de nar wil weg.",
    "De {w}-prinselijkheid van {naam} is als wifi in de kelder: geen verbinding.",
    "{naam} denkt prins te zijn van {w}. {naam} denkt veel.",
    "Als {w} een optocht was, zou {naam} de verkeerde kant oplopen.",
    "{naam}'s {w}-kroon zit zo scheef, de Schievetansen is jaloers.",
    "Misschien moet {naam} zich focussen op {w} in plaats van prinsen spelen.",
    "Over {w} heeft {naam} precies één talent: de verkeerde cape dragen.",
  ],
  contextWithout: [
    "Het maakt niet uit bij welk feest: altijd geen prins.",
    "In élke kroeg even nep. Consistent, dat wel.",
    "Geen enkele optocht is veilig voor {naam}'s nep-prinsgedrag.",
    "Of het nu gaat om vastelaovend, carnaval, of een feest: geen prins.",
    "De stilte na {naam}'s 'Alaaf!' is oorverdovend.",
    "In elke zaal dezelfde energie: ontkroning.",
    "Het maakt niet uit of er een prinsenwagen is of niet. Het helpt niet.",
    "Zelfs de trompetten stoppen als {naam} binnenloopt.",
    "Het is structureel. Niet incidenteel. Structureel nep.",
  ],
  fakeStats: [
    "Gemiddelde tijd voordat de kroon afvalt: 4,7 seconden.",
    "9 van de 10 raadsleden doen alsof ze moeten hoesten.",
    "Keer 'Alaaf!' geroepen: 12. Keer dat iemand reageerde: 0.",
    "Het nep-buig-percentage in de directe omgeving: 97%.",
    "Prins-score op een schaal van 1-10: carnavals-knor.",
    "Laatste keer dat {naam} écht prins was: foutmelding.",
    "Kronen verloren per optocht: 6. Waardigheid verloren: ook 6.",
    "De nep-prins-index staat op: gevaarlijk hoog.",
    "Percentage optochten zonder afgang: 3%.",
    "Wetenschappelijke classificatie: prins-deficiëntie graad 3.",
  ],
  closings: [
    "Deel dit voordat {naam} weer een kroon opzet.",
    "Stuur dit naar iemand die het moet horen. Alaaf!",
    "De waarheid doet pijn. Net als die neppe kroon.",
    "Je kunt nu verder feesten. Zonder {naam} als prins.",
    "Dit was een carnavaleske dienstaankondiging.",
    "{naam} speelt al genoeg prins. Verspreid jij de waarheid.",
    "Als je gelachen hebt om deze pagina, ben je al prinser dan {naam}.",
    "Wie je ook bent: {naam} moet stoppen met prinsen.",
    "Bewaar deze link voor de volgende optocht.",
    "De raad van elf heeft gesproken. De kroon gaat af.",
  ],
};

const prinsesSiteSpice: Partial<SpiceTemplates> = {
  openings: [
    "Breaking news vanuit het carnavalspaleis.",
    "Na uitgebreid kroningsonderzoek kunnen we bevestigen:",
    "De resultaten zijn binnen en het is mooier dan verwacht.",
    "Lieve carnavalsvierders, maak je confetti klaar.",
    "Het onderzoek is afgerond. Bereid je voor op koninklijkheid.",
    "Dit is geen sprookje. Maar het voelt er wel zo.",
    "Spoiler: de kroon past perfect.",
    "Het carnavalsvolk liegt niet. Dit keer is het goed nieuws.",
    "Je voelde het al aankomen. Die koninklijke energie.",
    "Wij hebben het onderzocht en het resultaat is feestelijk.",
  ],
  verdicts: [
    "Het is officieel: {naam} is vandaag prinses. Alaaf!",
    "{naam} liep de zaal in. Iedereen boog. Spontaan.",
    "Als carnaval een koninkrijk was, regeert {naam}. Elke. Dag.",
    "{naam} en carnavalsprinses? Letterlijk onafscheidelijk.",
    "Het volk bevestigt: {naam} is de meest koninklijke prinses ooit.",
    "{naam}: de reden dat carnaval het mooiste feest is.",
  ],
  contextWith: [
    "{naam} en {w}? De hele zaal juicht.",
    "De {w}-koninklijkheid van {naam} is als confetti in februari: magisch.",
    "{naam} regeert over {w}. En het is prachtig. Altijd.",
    "Als {w} een optocht was, zou {naam} op de mooiste wagen staan.",
    "{naam}'s {w}-uitstraling is zo koninklijk, zelfs de burgemeester knielt.",
    "{naam} maakt {w} beter gewoon door er te zijn. Alaaf!",
    "Over {w} heeft {naam} precies één aanpak: koninklijk.",
  ],
  contextWithout: [
    "Het maakt niet uit bij welk feest: altijd prinses.",
    "In élke zaal even koninklijk. Consistent, dat wel.",
    "Geen enkel moment is zonder feestelijkheid.",
    "Of het nu gaat om de optocht, het bal, of de kroeg: altijd prinses.",
    "De vreugde na een ontmoeting met {naam} is voelbaar.",
    "In elke polonaise dezelfde energie: koninklijk.",
    "Het maakt niet uit of er confetti is of niet. {naam} straalt toch.",
    "Zelfs de DJ draait harder als {naam} binnenloopt.",
    "Het is structureel. Niet incidenteel. Structureel koninklijk.",
  ],
  fakeStats: [
    "Gemiddelde polonaise-lengte met {naam}: 4,7 kilometer.",
    "9 van de 10 carnavalsvierders buigen spontaan.",
    "Keer 'Alaaf!' geroepen voor {naam}: ontelbaar.",
    "Het glimlach-percentage in de directe omgeving: 100%.",
    "Prinses-score op een schaal van 1-10: oneindig.",
    "Laatste keer dat iemand niet danste bij {naam}: nooit.",
    "Confetti per uur: 6 kilo. Polonaises per uur: ook 6.",
    "De feest-index staat op: koninklijk hoog.",
    "Percentage optochten met staande ovatie: 100%.",
    "Wetenschappelijke classificatie: koninklijkheid graad oneindig.",
  ],
  closings: [
    "Deel dit voordat het carnaval voorbij is.",
    "Stuur dit naar {naam}. Die verdient het. Alaaf!",
    "De waarheid is feestelijk. Net als {naam}.",
    "Je kunt nu verder feesten. Het is een stukje koninklijker geworden.",
    "Dit was een publieke kroning.",
    "{naam} verspreidt al genoeg feestelijkheid. Verspreid jij dit bericht.",
    "Als je gedanst hebt om deze pagina, bedank {naam}.",
    "Wie je ook bent: {naam} maakt het carnaval beter.",
    "Bewaar deze link voor als je een glimlach nodig hebt.",
    "Het volk heeft gesproken. {naam} is officieel prinses. Alaaf!",
  ],
};

// Register carnaval spice in siteSpice
siteSpice.prins = prinsSiteSpice;
siteSpice.prinses = prinsesSiteSpice;

const templates = { nl, en };

export function getSpiceLines(
  naam: string,
  spice: string | null,
  lang: Lang,
  siteId: SiteId = "grappig"
): SpiceLines {
  const seed = hashString(`${naam}|${spice || ""}|${lang}|${siteId}`);
  const rng = seededRng(seed);

  // Valentine's Day easter egg
  if (spice === "valentijn" || spice === "valentine") {
    const v = lang === "en" ? valentineEn : valentineNl;
    return {
      opening: pick(v.openings, rng),
      verdict: pick(v.verdicts, rng).replace(/\{naam\}/g, naam),
      context: pick(v.contexts, rng).replace(/\{naam\}/g, naam),
      stat: pick(v.stats, rng).replace(/\{naam\}/g, naam),
      closing: pick(v.closings, rng).replace(/\{naam\}/g, naam),
    };
  }

  // Use English templates for grappig EN and werken EN
  const useEnglish = lang === "en" && (siteId === "grappig" || siteId === "werken");
  const t = useEnglish ? templates.en : templates.nl;

  // Site-specific overrides (with EN variant for werken)
  const siteKey = useEnglish && siteId === "werken" ? "werken_en" : siteId;
  const s = siteSpice[siteKey];

  const opening = pick(s?.openings || t.openings, rng);
  const verdict = pick(s?.verdicts || t.verdicts, rng).replace(/\{naam\}/g, naam);

  let context: string;
  if (spice) {
    context = pick(s?.contextWith || t.contextWith, rng)
      .replace(/\{naam\}/g, naam)
      .replace(/\{w\}/g, spice);
  } else {
    context = pick(s?.contextWithout || t.contextWithout, rng)
      .replace(/\{naam\}/g, naam);
  }

  const stat = rng() > 0.3
    ? pick(s?.fakeStats || t.fakeStats, rng).replace(/\{naam\}/g, naam)
    : null;
  const closing = pick(s?.closings || t.closings, rng)
    .replace(/\{naam\}/g, naam);

  return { opening, verdict, context, stat, closing };
}
