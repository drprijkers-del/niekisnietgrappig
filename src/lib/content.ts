import { hashString, seededRng } from "./utils";
import { SiteId, SITES } from "./sites";

export type Lang = "nl" | "en";

// Custom subtitles for specific friends — only shown on grappig site
const CUSTOM_SUBTITLES: Record<string, string> = {
  luuk: "...wel altijd met een goede vraag!",
  max: "...maar altijd wel ergens meer kennis over (vindt hij) of een goed algoritme ervoor",
  koen: "...maar dat boeit hem niet, zolang hij maar grappiger is dan de gemiddelde Max",
  emiel: "zéker niet grappig... behalve tegen bootschoonmakendeduitsersindeochtend",
  niek: "...kan wel goed fietsen (op een rollerbank)",
  cevdet: "ok... misschien een beetje grappig",
  chris: "...behalve in het Zweeds misschien. Dan wel...",
  casper: "...wel het meest relaxt niet grappig",
  tijn: "...zeker niet bij krabbende ankers",
};

/**
 * Get custom subtitle for a name (if it exists).
 * Only on grappig site.
 */
export function getCustomSubtitle(naam: string, siteId: SiteId = "grappig"): string | null {
  if (siteId !== "grappig") return null;
  const key = naam.toLowerCase().trim();
  return CUSTOM_SUBTITLES[key] ?? null;
}

function randomStats(naam: string, lang: Lang, siteId: SiteId) {
  const rng = seededRng(hashString(`stats|${naam}|${lang}|${siteId}`));
  const r = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;

  if (siteId === "grappig") {
    const failed = r(23, 89);
    const polite = r(89, 99);
    const repeats = r(61, 96);
    const silence = (rng() * 8 + 3.5).toFixed(1);
    if (lang === "en") {
      return [
        { label: "Failed jokes per day", waarde: `${failed}` },
        { label: "People laughing out of politeness", waarde: `${polite}%` },
        { label: "Jokes that are repeats", waarde: `${repeats}%` },
        { label: "Seconds of silence after a joke", waarde: silence },
      ];
    }
    return [
      { label: "Mislukte grappen per dag", waarde: `${failed}` },
      { label: "Mensen die uit beleefdheid lachen", waarde: `${polite}%` },
      { label: "Grappen die herhaling zijn", waarde: `${repeats}%` },
      { label: "Seconden stilte na een grap", waarde: silence },
    ];
  }

  if (siteId === "knor") {
    return [
      { label: "Keer biertje geweigerd", waarde: `${r(12, 67)}` },
      { label: "Leden die hem niet kennen", waarde: `${r(85, 99)}%` },
      { label: "Keer 'ik word nog wel lid' gezegd", waarde: `${r(15, 45)}` },
      { label: "Borrels gemist", waarde: `${r(40, 120)}` },
    ];
  }

  if (siteId === "honger") {
    return [
      { label: "Snacks per dag", waarde: `${r(8, 35)}` },
      { label: "Keer 'ik heb honger' gezegd", waarde: `${r(20, 80)}` },
      { label: "Koelkasten leeggeroofd", waarde: `${r(3, 25)}` },
      { label: "Minuten tot volgend hapje", waarde: `${r(1, 15)}` },
    ];
  }

  if (siteId === "werken") {
    if (lang === "en") {
      return [
        { label: "Netflix hours per workday", waarde: `${r(4, 12)}` },
        { label: "Excuses used today", waarde: `${r(15, 60)}` },
        { label: "Unread work emails", waarde: `${r(200, 5000)}` },
        { label: "Productivity score", waarde: `${r(1, 8)}%` },
      ];
    }
    return [
      { label: "Netflix-uren per werkdag", waarde: `${r(4, 12)}` },
      { label: "Smoesjes vandaag", waarde: `${r(15, 60)}` },
      { label: "Ongelezen e-mails", waarde: `${r(200, 5000)}` },
      { label: "Productiviteitscore", waarde: `${r(1, 8)}%` },
    ];
  }

  if (siteId === "liefste") {
    return [
      { label: "Knuffels uitgedeeld", waarde: `${r(8, 30)}` },
      { label: "Mensen blij gemaakt", waarde: `${r(90, 100)}%` },
      { label: "Complimenten vandaag", waarde: `${r(15, 50)}` },
      { label: "Liefste-score", waarde: `${r(95, 100)}/100` },
    ];
  }

  // lief
  return [
    { label: "Keer onaardig vandaag", waarde: `${r(5, 25)}` },
    { label: "Mensen die boos zijn", waarde: `${r(60, 95)}%` },
    { label: "Welgemeende sorry's ooit", waarde: `${r(0, 3)}` },
    { label: "Lief-score", waarde: `${r(1, 12)}/100` },
  ];
}

// Site-specific content generators
function getContentForSite(naam: string, siteId: SiteId) {
  if (siteId === "knor") {
    return {
      redenen: [
        { titel: `${naam} is gewoon nooit lid geworden`, tekst: `Iedereen heeft het geprobeerd. Uitnodigingen, hints, directe vragen. Maar ${naam} blijft hardnekkig niet-lid. Het is geen rebellie — het is gewoon een knor.` },
        { titel: "De excuses worden steeds creatiever", tekst: `"Ik heb het druk." "Ik vergat me in te schrijven." "Ik dacht dat het een sportvereniging was." ${naam} heeft ze allemaal al gebruikt. Geen overtuigend.` },
        { titel: "Komt wel naar de borrel, maar is geen lid", tekst: `${naam} profiteert graag van de gezelligheid zonder zich te committeren. De gratis bitterballen eten zonder contributie te betalen? Typisch knor-gedrag.` },
        { titel: `${naam} kent de vereniging niet eens`, tekst: `Vraag ${naam} naar het bestuur, de commissies, of het logo. Geen idee. Vraag naar de bar-openingstijden? Dan weet ${naam} het ineens wel.` },
        { titel: "Leden-only evenementen? Skip.", tekst: `Terwijl iedereen geniet van het jaarlijkse gala, zit ${naam} thuis. Niet uitgenodigd. Want: knor.` },
        { titel: "Het is structureel", tekst: `Dit is geen fase. ${naam} is al jaren een knor en er is geen verbetering in zicht. De vereniging heeft het geaccepteerd. Jij zou dat ook moeten doen.` },
      ],
      getuigenissen: [
        { quote: `${naam} stond bij de deur en vroeg of dit een openbare kroeg was.`, auteur: "Commissielid" },
        { quote: `Ik heb ${naam} drie keer een aanmeldformulier gegeven. Drie keer 'verloren'.`, auteur: "Secretaris" },
        { quote: `${naam} is de definitie van een knor.`, auteur: "Anoniem bestuurslid" },
        { quote: `${naam} kwam naar de borrel, dronk 4 biertjes en zei: "Leuke kroeg." Het was de ALV.`, auteur: "Penningmeester" },
        { quote: `Ik heb ${naam} uitgenodigd voor de introweek. ${naam} dacht dat het een festival was.`, auteur: "Eerstejaars" },
      ],
      faq: [
        { vraag: `Kan ${naam} nog lid worden?`, antwoord: `Theoretisch wel. Praktisch: nee. De motivatie ontbreekt al jaren.` },
        { vraag: `Is knor zijn erg?`, antwoord: `Het is niet dodelijk, maar het is wel sociaal onhandig. Je mist borrels, tradities en bovenal: het gevoel erbij te horen.` },
        { vraag: `Is dit niet een beetje gemeen?`, antwoord: `${naam} had gewoon lid kunnen worden. Dit is een publieke dienst.` },
      ],
      tips: [
        `Sleep ${naam} mee naar de eerstvolgende borrel. Desnoods onder dwang.`,
        `Print het aanmeldformulier uit en plak het op de koelkast.`,
        `Stuur dit bewijs naar de rest. Groepsdruk is een bewezen methode.`,
      ],
    };
  }

  if (siteId === "honger") {
    return {
      redenen: [
        { titel: `${naam} heeft altijd honger. Altijd.`, tekst: `Net gegeten? Honger. Drie borden op? Honger. Het is 3 uur 's nachts? Honger. Het is geen fase — het is een levensstijl.` },
        { titel: "De koelkast heeft PTSD", tekst: `Elke keer als ${naam} de keuken binnenloopt, trilt de koelkast. Resten van gisteren? Weg. Die dure kaas? Weg. De hoop op een rustig avondje? Ook weg.` },
        { titel: `${naam} denkt in maaltijden`, tekst: `"Hoe laat is het?" "Bijna lunch." "Het is 9 uur." "Pre-lunch." Terwijl de rest in uren denkt, denkt ${naam} in gangen.` },
        { titel: "Snacks zijn een levensstijl", tekst: `${naam} heeft altijd minimaal 3 noodsnacks bij zich. Niet voor noodgevallen. Voor het kwartier tussen lunch en tussendoortje.` },
        { titel: "Restaurants kennen de naam", tekst: `Bij de all-you-can-eat hangt een foto van ${naam} bij de kassa. Niet als werknemer van de maand.` },
        { titel: "Het is wetenschappelijk bewezen", tekst: `Na uitgebreid onderzoek: de maag van ${naam} is een zwart gat. Er gaat eten in. Er komt niks uit. Alleen meer honger.` },
      ],
      getuigenissen: [
        { quote: `${naam} at mijn lunch op terwijl ik nog aan het uitleggen was dat het mijn lunch was.`, auteur: "Collega" },
        { quote: `We bestelden voor 6. ${naam} at voor 4. De rest deelde wat overbleef.`, auteur: "Restauranteigenaar" },
        { quote: `${naam} vroeg of er nog wat was. De hele tafel was al leeg.`, auteur: "Huisgenoot" },
        { quote: `${naam} zei "ik heb geen honger." Vijf minuten later was de hele koelkast leeg.`, auteur: "Huisgenoot #2" },
        { quote: `We hadden een taart voor 12 personen. ${naam} vroeg of er ook een voor hemzelf was.`, auteur: "Verjaardagsganger" },
      ],
      faq: [
        { vraag: `Heeft ${naam} echt áltijd honger?`, antwoord: `Ja. Wetenschappers hebben geprobeerd ${naam} vol te krijgen. Ze zijn gestopt met proberen.` },
        { vraag: `Is dit een eetstoornis?`, antwoord: `Nee. Het is een superkracht met bijwerkingen. Vooral voor de koelkast.` },
        { vraag: `Is dit niet gemeen?`, antwoord: `${naam} leest dit waarschijnlijk niet. Die is aan het eten.` },
      ],
      tips: [
        `Geef ${naam} een tosti. Probleem opgelost. Voor nu.`,
        `Verstop de snacks niet. ${naam} vindt ze toch.`,
        `Bestel een pizza. Eentje voor ${naam}, eentje voor de rest.`,
      ],
    };
  }

  if (siteId === "werken") {
    return {
      redenen: [
        { titel: `${naam} en productiviteit hebben een LAT-relatie`, tekst: `Ze zien elkaar af en toe. Op afstand. Met grote twijfel. Ondertussen ligt ${naam} op de bank. Structureel.` },
        { titel: "De snooze-knop is versleten", tekst: `7:00 wekker. 7:01 snooze. 7:02 snooze. 11:30 "ik begin zo." ${naam}'s ochtend in vier stappen.` },
        { titel: `"Ik werk beter onder druk" — ${naam}`, tekst: `Spoiler: de druk is er al maanden. Er is nog niks gebeurd. De deadline was gisteren. ${naam} heeft het niet gemerkt.` },
        { titel: `${naam}'s LinkedIn liegt`, tekst: `"Hard worker. Go-getter. Resultaatgericht." De bank in de woonkamer vertelt een ander verhaal.` },
        { titel: "Netflix is geen beroep", tekst: `${naam} heeft meer series afgekeken dan taken afgerond. De ratio is niet gezond. HR maakt zich zorgen.` },
        { titel: `Dit is je interventie, ${naam}`, tekst: `Je vrienden. De maatschappij. Je bankrekening. Iedereen roept hetzelfde: ga eens werken. Het is tijd.` },
      ],
      getuigenissen: [
        { quote: `${naam} vroeg hoe laat het was. Ik zei 14:00. ${naam} zei "oh, dan ga ik zo beginnen."`, auteur: "Collega" },
        { quote: `Ik heb ${naam} één keer zien werken. Achteraf bleek het een loading screen.`, auteur: "Teamleider" },
        { quote: `${naam} heeft 'out of office' aan. Al 3 maanden.`, auteur: "HR" },
        { quote: `${naam} zei "ik werk vanuit huis." De PS5 stond aan. De laptop niet.`, auteur: "Huisgenoot" },
        { quote: `${naam} had een deadline van 3 weken. Na 2,5 week vroeg ${naam}: "Welke deadline?"`, auteur: "Projectmanager" },
      ],
      faq: [
        { vraag: `Werkt ${naam} echt nooit?`, antwoord: `Soms. Maar het openen van de koelkast telt technisch gezien niet.` },
        { vraag: `Is er hoop voor ${naam}?`, antwoord: `De wetenschap is voorzichtig pessimistisch. De bank is te comfortabel.` },
        { vraag: `Is dit niet gemeen?`, antwoord: `Dit is liefde. Harde, eerlijke, werkgerelateerde liefde.` },
      ],
      tips: [
        `Zet de WiFi uit. Kijk wat er gebeurt.`,
        `Stuur ${naam} een vacature. Elke dag. Als reminder.`,
        `Verplaats de bank naar buiten. Subtiel maar effectief.`,
      ],
    };
  }

  if (siteId === "liefste") {
    return {
      redenen: [
        { titel: `${naam} is de liefste. Punt.`, tekst: `Geen discussie. Geen nuance. Gewoon een feit. De wetenschap heeft het bevestigd en wij ook.` },
        { titel: `Het ${naam}-effect`, tekst: `${naam} loopt een kamer in en de sfeer stijgt met 200%. Wetenschappers kunnen het niet verklaren. Wij wel: ${naam} is gewoon de liefste.` },
        { titel: "Complimenten als confetti", tekst: `${naam} deelt complimenten uit als confetti op Koningsdag. Oprecht. Warm. Altijd precies wat je nodig hebt.` },
        { titel: "De knuffels zijn legendarisch", tekst: `Warm. Stevig. Precies lang genoeg. Het soort knuffel waar je de rest van de dag van glimlacht.` },
        { titel: "Altijd daar als het nodig is", tekst: `Slechte dag? ${naam} belt. Stressweek? ${naam} stuurt iets liefs. Geen reden? ${naam} komt langs met chocola. Gewoon omdat.` },
        { titel: "Het is officieel", tekst: `Na duizenden getuigenissen, uitgebreid onderzoek en een berg aan bewijs: ${naam} is de liefste. Altijd geweest. Altijd zal zijn.` },
      ],
      getuigenissen: [
        { quote: `${naam} stuurde me een berichtje alleen om te zeggen dat ik geweldig ben. Mijn hele week was gemaakt.`, auteur: "Dankbare vriend" },
        { quote: `Ik was verdrietig. ${naam} kwam langs met taart. Zonder te vragen.`, auteur: "Collega" },
        { quote: `Als iedereen was als ${naam}, hadden we geen problemen.`, auteur: "Iedereen" },
        { quote: `${naam} onthield mijn verjaardag terwijl ik het zelf bijna was vergeten.`, auteur: "Verraste vriendin" },
        { quote: `Ik had een slechte dag. ${naam} stuurde een playlist met alleen maar feelgood-nummers. Precies wat ik nodig had.`, auteur: "Collega #2" },
      ],
      faq: [
        { vraag: `Is ${naam} echt zo lief?`, antwoord: `Ja. En deze website doet het nog tekort. In het echt is ${naam} nóg liever.` },
        { vraag: `Kan iemand liever zijn?`, antwoord: `Theoretisch misschien. Maar het bewijs wijst één kant op.` },
        { vraag: `Is dit niet overdreven?`, antwoord: `Nee. ${naam} verdient dit en meer. Deel de liefde.` },
      ],
      tips: [
        `Geef ${naam} een knuffel. Nu. Niet straks. Nu.`,
        `Stuur bloemen. Of gewoon dit bewijs. Dat is eigenlijk mooier.`,
        `Zeg het hardop. Doe het vandaag. ${naam} verdient het.`,
      ],
    };
  }

  if (siteId === "lief") {
    return {
      redenen: [
        { titel: `${naam} moet echt ff lief doen`, tekst: `Het is genoeg geweest. De chagrijnigheid is structureel. Iedereen heeft het gemerkt. Tijd voor een interventie.` },
        { titel: "Dat zuchtje was niet nodig", tekst: `Iemand stelt een normale vraag. ${naam} zucht alsof het een persoonlijke aanval is. Dat was het niet. Doe ff lief.` },
        { titel: "De goedemorgen die als dreigement klinkt", tekst: `${naam} zegt goedemorgen en het klinkt als een waarschuwing. Zelfs de koffie schrikt ervan.` },
        { titel: "Complimenten geven: een handleiding", tekst: `Stap 1: open je mond. Stap 2: zeg iets aardigs. ${naam} is vastgelopen bij stap 1. Al weken.` },
        { titel: `${naam} en empathie: het is ingewikkeld`, tekst: `Empathie is een vaardigheid die de meeste mensen beheersen. ${naam} staat nog in de wachtrij voor de tutorial.` },
        { titel: "Dit is je interventie", tekst: `${naam}, dit is je teken. Het universum, je vrienden en deze website zeggen hetzelfde: doe ff lief. Het kost niks.` },
      ],
      getuigenissen: [
        { quote: `${naam} zei goedemorgen en de hele kamer voelde zich aangevallen.`, auteur: "Collega" },
        { quote: `Ik vroeg hoe het ging. Het antwoord was een zucht van 8 seconden.`, auteur: "Bezorgde vriend" },
        { quote: `${naam} moet ff lief doen. Dat is alles.`, auteur: "Iedereen" },
        { quote: `${naam} gaf een compliment. Iedereen keek om of er iemand anders stond.`, auteur: "Verbijsterde collega" },
        { quote: `Ik stuurde ${naam} een hartje. Ik kreeg een punt terug. Letterlijk: "."`, auteur: "Vriendin" },
      ],
      faq: [
        { vraag: `Is ${naam} altijd zo?`, antwoord: `Helaas wel. Het is geen fase. Het is een patroon.` },
        { vraag: `Kan ${naam} lief leren doen?`, antwoord: `De wetenschap is voorzichtig optimistisch. De omgeving minder.` },
        { vraag: `Is dit gemeen?`, antwoord: `Nee. ${naam} is degene die ff lief moet doen. Wij helpen alleen.` },
      ],
      tips: [
        `Geef ${naam} een kopje thee. Kalmte is besmettelijk.`,
        `Stuur ${naam} een hartje. Eentje per uur tot het effect heeft.`,
        `Negeer het niet. Lief doen begint bij confrontatie.`,
      ],
    };
  }

  // Default: grappig (NL)
  return {
    redenen: [
      { titel: `Timing is alles, en ${naam} heeft het niet`, tekst: `Een goede grap draait om timing. ${naam} levert de punchline consequent op het verkeerde moment af. Als comedy een muziekinstrument was, speelt ${naam} constant uit de maat.` },
      { titel: "Recycling is goed voor het milieu, niet voor grappen", tekst: `${naam} vertelt dezelfde grap meerdere keren alsof het de eerste keer al niet pijnlijk genoeg was. Herhaling kan komisch zijn als het bewust wordt ingezet. Bij ${naam} is het gewoon een geheugenprobleem.` },
      { titel: "De 'moet je luisteren'-opening", tekst: `Als iemand begint met 'moet je luisteren, dit is echt grappig', weet je dat het niet grappig gaat worden. ${naam} doet dit elke keer. Het is de komische equivalent van een spoiler alert voor teleurstelling.` },
      { titel: "Het eigen-lach-syndroom", tekst: `${naam} lacht harder om de eigen grappen dan wie dan ook in de ruimte. Dit is wetenschappelijk bewezen een teken dat de grap niet sterk genoeg is om op eigen benen te staan.` },
      { titel: "Woordgrappen op het verkeerde niveau", tekst: `Er zijn goede woordgrappen en er zijn ${naam}-woordgrappen. Het verschil? Bij goede woordgrappen kreun je van bewondering. Bij ${naam}-woordgrappen kreun je van pijn.` },
      { titel: "De eindeloze context", tekst: `Voordat ${naam} bij de clou komt, volgt er eerst 15 minuten achtergrondinformatie. Tegen de tijd dat de punchline valt, is iedereen vergeten waar het verhaal over ging. Inclusief ${naam} zelf.` },
    ],
    getuigenissen: [
      { quote: "Ik dacht dat het een vraag was. Blijkbaar was het een grap.", auteur: "Anonieme collega" },
      { quote: `${naam} vertelde een grap op een feestje. Het feestje was daarna afgelopen.`, auteur: "Ex-feestganger" },
      { quote: `Ik heb een keer gelachen om een grap van ${naam}. Achteraf bleek ik te lachen om iets anders.`, auteur: "Vriend van een vriend" },
      { quote: `${naam} zei "wacht, ik heb er nog eentje." Drie mensen stonden op en gingen weg.`, auteur: "Ooggetuige" },
      { quote: `Mijn telefoon autocorrecte "${naam}" naar "niet grappig." Zelfs technologie weet het.`, auteur: "Groepsapp-lid" },
    ],
    faq: [
      { vraag: `Maar soms lachen mensen toch om ${naam}?`, antwoord: `Dat klopt. Dit fenomeen staat bekend als "medelachten" \u2014 een sociaal overlevingsmechanisme waarbij mensen lachen om een ongemakkelijke stilte te doorbreken. Het heeft niets met humor te maken.` },
      { vraag: `Kan ${naam} ooit grappig worden?`, antwoord: `De wetenschap is hier niet optimistisch over. Hoewel humor theoretisch aangeleerd kan worden, vereist dit een mate van zelfbewustzijn die ${naam} op dit moment niet bezit.` },
      { vraag: "Is deze website niet een beetje gemeen?", antwoord: `Deze website is een publieke dienst. Wij geloven dat eerlijkheid uiteindelijk in ieders belang is. Bovendien: als ${naam} dit leest en er om kan lachen, is dat het grappigste dat diegene ooit heeft gedaan.` },
    ],
    tips: [
      `Geef ${naam} een koekje. Niet omdat het helpt, maar als afleidingsmanoeuvre.`,
      `Stuur ${naam} naar een comedy workshop. Of beter: stuur het bewijs en laat het inzinken.`,
      `Zeg het hardop op een verjaardag. Liefst als ${naam} net een mop vertelt.`,
    ],
  };
}

export function getContent(naam: string, lang: Lang = "nl", siteId: SiteId = "grappig") {
  // English content for werken site
  if (lang === "en" && siteId === "werken") {
    return {
      redenen: [
        { titel: `${naam} and productivity are not on speaking terms`, tekst: `They tried couples therapy. ${naam} slept through it. Everyone else is being productive. ${naam}? On the couch. Structurally.` },
        { titel: "The snooze button fears ${naam}", tekst: `7:00 alarm. 7:01 snooze. Repeat until noon. "I'm a slow starter" is not a personality trait.` },
        { titel: `"I work better under pressure"`, tekst: `The pressure has been here for months. Nothing has happened. The deadline was yesterday. ${naam} didn't notice.` },
        { titel: `${naam}'s LinkedIn is fiction`, tekst: `"Hard worker. Results-driven. Go-getter." The couch tells a different story. HR has questions.` },
        { titel: "Netflix is not a career", tekst: `${naam} has finished more series than tasks. The ratio is concerning. The watchlist is longer than the CV.` },
        { titel: "This is your intervention", tekst: `Your friends. Society. Your bank account. Everyone is saying the same thing: get to work. It's time.` },
      ],
      statistieken: randomStats(naam, "en", siteId),
      getuigenissen: [
        { quote: `${naam} asked what time it was. I said 2 PM. ${naam} said "cool, I'll start soon."`, auteur: "Colleague" },
        { quote: `I once saw ${naam} working. Turns out it was a loading screen.`, auteur: "Team lead" },
        { quote: `${naam} has been 'out of office' for 3 months.`, auteur: "HR" },
        { quote: `${naam} said "I'm working from home." The PS5 was on. The laptop wasn't.`, auteur: "Roommate" },
        { quote: `${naam} had a 3-week deadline. After 2.5 weeks: "What deadline?"`, auteur: "Project manager" },
      ],
      faq: [
        { vraag: `Does ${naam} ever actually work?`, antwoord: `Sometimes. But opening the fridge doesn't technically count.` },
        { vraag: `Is there hope?`, antwoord: `Science is cautiously pessimistic. The couch is too comfortable.` },
        { vraag: "Isn't this mean?", antwoord: `This is love. Hard, honest, work-related love.` },
      ],
      tips: [
        `Turn off the WiFi. See what happens.`,
        `Send ${naam} a job listing. Every day. As a reminder.`,
        `Move the couch outside. Subtle but effective.`,
      ],
    };
  }

  // English content only available on grappig site
  if (lang === "en" && siteId === "grappig") {
    return {
      redenen: [
        { titel: `Timing is everything, and ${naam} doesn't have it`, tekst: `A good joke is all about timing. ${naam} consistently delivers the punchline at the wrong moment. If comedy were a musical instrument, ${naam} would be permanently off-beat.` },
        { titel: "Recycling is great for the planet, not for jokes", tekst: `${naam} tells the same joke multiple times as if the first time wasn't painful enough. Repetition can be comedic when used intentionally. With ${naam}, it's just a memory problem.` },
        { titel: "The 'listen, this is really funny' opener", tekst: `When someone starts with 'listen, this is really funny', you know it's not going to be funny. ${naam} does this every single time. It's the comedic equivalent of a spoiler alert for disappointment.` },
        { titel: "The self-laugh syndrome", tekst: `${naam} laughs harder at their own jokes than anyone else in the room. This is scientifically proven to be a sign that the joke isn't strong enough to stand on its own.` },
        { titel: "Puns at the wrong level", tekst: `There are good puns and there are ${naam}-puns. The difference? Good puns make you groan in admiration. ${naam}-puns make you groan in pain.` },
        { titel: "The endless context", tekst: `Before ${naam} gets to the punchline, there's first 15 minutes of background information. By the time the punchline drops, everyone has forgotten what the story was about. Including ${naam}.` },
      ],
      statistieken: randomStats(naam, "en", siteId),
      getuigenissen: [
        { quote: "I thought it was a question. Apparently it was a joke.", auteur: "Anonymous colleague" },
        { quote: `${naam} told a joke at a party. The party was over after that.`, auteur: "Former party-goer" },
        { quote: `I once laughed at a joke from ${naam}. Turns out I was laughing at something else.`, auteur: "Friend of a friend" },
        { quote: `${naam} said "wait, I have another one." Three people stood up and left.`, auteur: "Eyewitness" },
        { quote: `My phone autocorrected "${naam}" to "not funny." Even technology knows.`, auteur: "Group chat member" },
      ],
      faq: [
        { vraag: `But sometimes people do laugh at ${naam}?`, antwoord: `That's correct. This phenomenon is known as "sympathy laughing" \u2014 a social survival mechanism where people laugh to break an awkward silence. It has nothing to do with humor.` },
        { vraag: `Can ${naam} ever become funny?`, antwoord: `Science is not optimistic about this. While humor can theoretically be learned, it requires a level of self-awareness that ${naam} currently does not possess.` },
        { vraag: "Isn't this website a bit mean?", antwoord: `This website is a public service. We believe that honesty is ultimately in everyone's best interest. Besides: if ${naam} reads this and can laugh about it, that would be the funniest thing they've ever done.` },
      ],
      tips: [
        `Give ${naam} a cookie. Not because it helps, but as a distraction maneuver.`,
        `Send ${naam} to a comedy workshop. Or better: send the evidence and let it sink in.`,
        `Say it out loud at a birthday party. Preferably while ${naam} is telling a joke.`,
      ],
    };
  }

  const siteContent = getContentForSite(naam, siteId);
  return {
    ...siteContent,
    statistieken: randomStats(naam, lang, siteId),
  };
}

export function getUI(lang: Lang = "nl", siteId: SiteId = "grappig") {
  const site = SITES[siteId];

  if (lang === "en" && siteId === "werken") {
    return {
      hero: {
        subtitle: "A professional intervention",
        before: ", you should be",
        highlight: "working",
        after: "",
        description: "This website exists because someone close to you is concerned about your productivity. Or lack thereof.",
        cta: "See the evidence",
      },
      stats: { heading: "The numbers don't lie" },
      reasons: {
        heading: "Scientifically proven",
        subheading: (naam: string) => `6 reasons why ${naam} should be working`,
      },
      testimonials: { heading: "Eyewitness accounts", subheading: "What others say" },
      faqSection: { heading: "Frequently asked questions", subheading: "FAQ" },
      tipsSection: { heading: "What can you do?", subheading: "Tips" },
      suggestBox: {
        heading: "What are we missing?",
        placeholder: (naam: string) => `${naam} once pretended to...`,
        button: "Add to the file",
        success: "Added to the file.",
        countLabel: (n: number) => `${n} tips received`,
      },
      share: {
        heading: "Know someone else who should be working?",
        description: "Send this intervention or pick your next target.",
        shareButton: () => `Share via WhatsApp`,
        copied: "Link copied!",
        copyLink: "Copy link",
        create: "Pick a new target",
        shareText: (naam: string) => `${naam} get to work 😂`,
      },
      footer: {
        stichting: () => `This is satire. Please don't sue us.`,
        disclaimer: (naam: string) => `No one named ${naam} was harmed in the making of this website. Only their productivity.`,
      },
      landing: {
        subtitle: "A professional intervention",
        title: "Who should be",
        highlight: "working",
        after: "?",
        description: "Enter a name and discover why the couch is not a workplace.",
        placeholder: "Enter a name...",
        button: "Expose them",
      },
    };
  }

  if (lang === "en" && siteId === "grappig") {
    return {
      hero: {
        subtitle: "A public service announcement",
        before: "is",
        highlight: "not",
        after: "funny",
        description: "This website was created to inform the world about an uncomfortable truth that has been kept quiet for far too long.",
        cta: "See the evidence",
      },
      stats: { heading: "The numbers don't lie" },
      reasons: {
        heading: "Scientifically proven",
        subheading: (naam: string) => `6 reasons why ${naam} is not funny`,
      },
      testimonials: { heading: "Eyewitness accounts", subheading: "What others say" },
      faqSection: { heading: "Frequently asked questions", subheading: "FAQ" },
      tipsSection: { heading: "What can you do?", subheading: "Tips" },
      suggestBox: {
        heading: "What are we missing?",
        placeholder: (naam: string) => `That time ${naam}...`,
        button: "Add to the file",
        success: "Added to the file.",
        countLabel: (n: number) => `${n} tips received`,
      },
      share: {
        heading: "Know someone else who isn't funny?",
        description: "Spread the truth or pick your next victim.",
        shareButton: () => `Share via WhatsApp`,
        copied: "Link copied!",
        copyLink: "Copy link",
        create: "Pick a new victim",
        shareText: (naam: string) => `Lmaooo ${naam} look 😂`,
      },
      footer: {
        stichting: () => `This is satire. Please don't sue us.`,
        disclaimer: (naam: string) => `No one named ${naam} was harmed in the making of this website. Only their ego.`,
      },
      landing: {
        subtitle: "A public service announcement",
        title: "Who is",
        highlight: "not",
        after: "funny?",
        description: "Enter a name and discover the scientific evidence.",
        placeholder: "Enter a name...",
        button: "Prove it",
      },
    };
  }

  const phraseParts = site.phrase;

  // Site-specific hero subtitles (name result page)
  const heroSubtitle: Record<SiteId, string> = {
    grappig: "Een publieke dienstaankondiging",
    knor: "Een publieke dienstaankondiging",
    honger: "Een gastronomische noodmelding",
    werken: "Een professionele interventie",
    liefste: "Een hartverwarmend onderzoek",
    lief: "Een dringende lief-interventie",
  };

  // Site-specific hero descriptions (name result page)
  const heroDescription: Record<SiteId, string> = {
    grappig: "Deze website is opgezet om de wereld te informeren over een ongemakkelijke waarheid die al veel te lang verzwegen wordt.",
    knor: "Deze website is opgezet om de wereld te informeren over een ongemakkelijke waarheid die al veel te lang verzwegen wordt.",
    honger: "Deze website bestaat omdat iemand in je omgeving zich ernstig zorgen maakt over de inhoud van de koelkast.",
    werken: "Deze website bestaat omdat iemand in je omgeving zich ernstig zorgen maakt over je productiviteit. Of het gebrek daaraan.",
    liefste: "Deze website bestaat om de wereld te vertellen wat iedereen al wist. Maar nu met wetenschappelijk bewijs.",
    lief: "Deze website bestaat omdat iemand in je omgeving vindt dat je ff lief moet doen. En ze hebben gelijk.",
  };

  // Site-specific footer disclaimers
  const footerDisclaimer: Record<SiteId, (naam: string) => string> = {
    grappig: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun ego.`,
    knor: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun ego.`,
    honger: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen de koelkast.`,
    werken: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun productiviteit.`,
    liefste: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Integendeel.`,
    lief: (naam) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun reputatie.`,
  };

  return {
    hero: {
      subtitle: heroSubtitle[siteId],
      before: phraseParts.before,
      highlight: phraseParts.highlight,
      after: phraseParts.after,
      description: heroDescription[siteId],
      cta: "Bekijk het bewijs",
    },
    stats: { heading: "De cijfers liegen niet" },
    reasons: {
      heading: "Wetenschappelijk onderbouwd",
      subheading: (naam: string) => {
        if (siteId === "grappig") return `6 redenen waarom ${naam} niet grappig is`;
        if (siteId === "knor") return `6 redenen waarom ${naam} een knor is`;
        if (siteId === "honger") return `6 redenen waarom ${naam} altijd honger heeft`;
        if (siteId === "werken") return `6 redenen waarom ${naam} eens moet gaan werken`;
        if (siteId === "liefste") return `6 redenen waarom ${naam} de liefste is`;
        if (siteId === "lief") return `6 redenen waarom ${naam} ff lief moet doen`;
        return `6 redenen over ${naam}`;
      },
    },
    testimonials: { heading: "Ooggetuigenverslagen", subheading: "Wat anderen zeggen" },
    faqSection: { heading: "Veelgestelde vragen", subheading: "FAQ" },
    tipsSection: { heading: "Wat kun je doen?", subheading: "Tips" },
    suggestBox: {
      heading: "Wat missen we nog?",
      placeholder: (naam: string) => {
        if (siteId === "knor") return `${naam} had een keer een excuus...`;
        if (siteId === "honger") return `${naam} at een keer...`;
        if (siteId === "werken") return `${naam} deed een keer alsof...`;
        if (siteId === "liefste") return `${naam} deed iets heel liefs...`;
        if (siteId === "lief") return `Die keer dat ${naam}...`;
        return `Welke reden missen we over ${naam}?`;
      },
      button: "Toevoegen aan dossier",
      success: "Toegevoegd aan het dossier.",
      countLabel: (n: number) => `${n} tips al ontvangen`,
    },
    share: {
      heading: site.share.heading,
      description: site.share.description,
      shareButton: () => `Deel via WhatsApp`,
      copied: "Link gekopieerd!",
      copyLink: "Kopieer link",
      create: siteId === "liefste" ? "Kies een nieuwe lieverd" : "Kies een nieuw doelwit",
      shareText: (naam: string) => site.share.whatsappText(naam),
    },
    footer: {
      stichting: () => `Dit is satire. Geen zorgen, geen rechtszaken.`,
      disclaimer: footerDisclaimer[siteId],
    },
    landing: {
      subtitle: site.landing.subtitle,
      title: site.landing.title,
      highlight: phraseParts.highlight,
      after: site.landing.landingAfter ? `${site.landing.landingAfter}?` : (phraseParts.after ? `${phraseParts.after}?` : "?"),
      description: site.landing.description,
      placeholder: site.landing.placeholder,
      button: site.landing.button,
    },
  };
}
