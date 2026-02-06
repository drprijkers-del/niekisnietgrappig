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
      { label: "Lege koelkasten achtergelaten", waarde: `${r(3, 25)}` },
      { label: "Minuten tot volgende maaltijd", waarde: `${r(1, 15)}` },
    ];
  }

  if (siteId === "werken") {
    if (lang === "en") {
      return [
        { label: "Hours of Netflix per workday", waarde: `${r(4, 12)}` },
        { label: "Excuses to avoid work", waarde: `${r(15, 60)}` },
        { label: "Unread work emails", waarde: `${r(200, 5000)}` },
        { label: "Productivity", waarde: `${r(1, 8)}%` },
      ];
    }
    return [
      { label: "Uur Netflix per werkdag", waarde: `${r(4, 12)}` },
      { label: "Excuses om niet te werken", waarde: `${r(15, 60)}` },
      { label: "Ongelezen werk-e-mails", waarde: `${r(200, 5000)}` },
      { label: "Productiviteit", waarde: `${r(1, 8)}%` },
    ];
  }

  if (siteId === "liefste") {
    return [
      { label: "Knuffels per dag", waarde: `${r(8, 30)}` },
      { label: "Mensen die blij worden", waarde: `${r(90, 100)}%` },
      { label: "Complimenten uitgedeeld", waarde: `${r(15, 50)}` },
      { label: "Liefste-score", waarde: `${r(95, 100)}/100` },
    ];
  }

  // lief
  return [
    { label: "Keer onaardig geweest", waarde: `${r(15, 80)}` },
    { label: "Mensen die boos zijn", waarde: `${r(60, 95)}%` },
    { label: "Welgemeende sorry's", waarde: `${r(0, 3)}` },
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
      ],
      faq: [
        { vraag: `Kan ${naam} nog lid worden?`, antwoord: `Theoretisch wel. Praktisch: nee. De motivatie ontbreekt al jaren.` },
        { vraag: `Is knor zijn erg?`, antwoord: `Het is niet dodelijk, maar het is wel sociaal onhandig. Je mist borrels, tradities en bovenal: het gevoel erbij te horen.` },
        { vraag: `Is dit niet een beetje gemeen?`, antwoord: `${naam} had gewoon lid kunnen worden. Dit is een publieke dienst.` },
      ],
    };
  }

  if (siteId === "honger") {
    return {
      redenen: [
        { titel: `${naam} heeft altijd honger`, tekst: `Het maakt niet uit wanneer, waar, of wat er net gegeten is. ${naam} heeft honger. Continu. Het is geen eetbuien — het is een levensstijl.` },
        { titel: "De koelkast is nooit veilig", tekst: `Als ${naam} langskomt, is de koelkast binnen 10 minuten leeg. Resten van gisteren? Weg. Die dure kaas? Weg. De hoop op een rustige avond? Ook weg.` },
        { titel: `${naam} denkt in maaltijden`, tekst: `Terwijl anderen denken in uren, denkt ${naam} in maaltijden. "Hoe laat is het?" "Bijna lunch." "Maar het is 10 uur." "Bijna lunch."` },
        { titel: "Altijd snacks bij de hand", tekst: `De tas van ${naam} bevat altijd minimaal drie noodsnacks. Niet voor noodgevallen — voor het half uur tussen maaltijden.` },
        { titel: "Restaurants vrezen de naam", tekst: `Bij all-you-can-eat buffetten staat er inmiddels een foto van ${naam} bij de deur met de tekst "Let op: maximaal 3 borden."` },
        { titel: "Het is wetenschappelijk bewezen", tekst: `Na uitgebreid onderzoek is vastgesteld dat de maag van ${naam} een bodemloze put is. Er is geen einde. Er is alleen honger.` },
      ],
      getuigenissen: [
        { quote: `${naam} at mijn lunch op terwijl ik nog aan het uitleggen was dat het mijn lunch was.`, auteur: "Anonieme collega" },
        { quote: `We bestelden voor 6 personen. ${naam} at het voor 4.`, auteur: "Restauranteigenaar" },
        { quote: `Ik heb ${naam} een keer zien eten. Ik heb sindsdien altijd extra koken.`, auteur: "Huisgenoot" },
      ],
      faq: [
        { vraag: `Heeft ${naam} een eetstoornis?`, antwoord: `Nee. ${naam} heeft gewoon altijd honger. Het is geen stoornis, het is een superkracht met bijwerkingen.` },
        { vraag: `Kan ${naam} ooit vol raken?`, antwoord: `De wetenschap twijfelt. Tot op heden is er geen bewijs gevonden van een "vol" moment.` },
        { vraag: `Is deze website niet gemeen?`, antwoord: `${naam} is nu waarschijnlijk aan het eten en heeft dit nog niet gezien. Geen zorgen.` },
      ],
    };
  }

  if (siteId === "werken") {
    return {
      redenen: [
        { titel: `${naam} moet echt eens gaan werken`, tekst: `Iedereen om ${naam} heen is productief bezig. ${naam}? Die ligt op de bank. Al de hele dag. Structureel.` },
        { titel: "Netflix telt niet als werk", tekst: `${naam} claimt "research" te doen, maar de watchlist zegt iets anders. 8 seizoenen in een week is geen cv-bullet.` },
        { titel: "De wekker gaat, maar het werk niet", tekst: `Elke ochtend gaat de wekker van ${naam} om 7 uur. Om 7:01 is de snooze-knop ingedrukt. Het werk begint... morgen.` },
        { titel: `${naam}'s excuses zijn legendarisch`, tekst: `"Ik wacht op inspiratie." "Ik werk beter onder druk." "Ik ben bezig met persoonlijke ontwikkeling." Spoiler: de ontwikkeling is stilgevallen.` },
        { titel: "Productiviteit: een abstract concept", tekst: `Als productiviteit een sport was, zou ${naam} niet eens in het stadion zitten. Misschien in de parkeergarage. Slapend.` },
        { titel: "Het is echt tijd", tekst: `Lieve ${naam}, dit is geen grap. Ga. Eens. Werken. De maatschappij wacht. Je bankrekening ook.` },
      ],
      getuigenissen: [
        { quote: `${naam} vroeg me wanneer de deadline was. Het was gisteren.`, auteur: "Projectleider" },
        { quote: `Ik heb ${naam} een keer aan het werk gezien. Het was per ongeluk.`, auteur: "Collega" },
        { quote: `${naam}'s LinkedIn zegt 'hard worker'. Ik heb bewijs van het tegendeel.`, auteur: "Ex-werkgever" },
      ],
      faq: [
        { vraag: `Werkt ${naam} echt nooit?`, antwoord: `Soms. Maar dan bedoelen we het openen van de laptop om Netflix te starten.` },
        { vraag: `Kan ${naam} veranderen?`, antwoord: `In theorie wel. Maar de bank is comfortabel en de motivatie ver te zoeken.` },
        { vraag: `Is deze website niet gemeen?`, antwoord: `Dit is een interventie. Soms heeft de waarheid een website nodig.` },
      ],
    };
  }

  if (siteId === "liefste") {
    return {
      redenen: [
        { titel: `${naam} is gewoon de allerliefste`, tekst: `Dit is geen mening. Het is een feit. Wetenschappelijk onderbouwd met jaren aan knuffels, complimenten en lieve berichtjes.` },
        { titel: "Altijd daar voor anderen", tekst: `Als iemand een slecht dag heeft, is ${naam} de eerste die belt. Of appt. Of gewoon langskomt met chocolade. Gewoon omdat het kan.` },
        { titel: `${naam} maakt iedereen blij`, tekst: `Het is een talent. Een gave. ${naam} hoeft maar een kamer binnen te lopen en de sfeer wordt beter. Wetenschappers noemen dit het "${naam}-effect".` },
        { titel: "De complimenten-machine", tekst: `${naam} deelt complimenten uit als confetti. Oprecht, warm, en altijd precies wat je nodig hebt. Niemand doet het beter.` },
        { titel: "Knuffels op niveau", tekst: `De knuffels van ${naam} zijn legendarisch. Warm, stevig, en precies lang genoeg. Het soort knuffel waar je de hele dag blij van bent.` },
        { titel: "Het is officieel", tekst: `Na uitgebreid onderzoek, duizenden getuigenissen en een berg bewijs: ${naam} is de liefste. Punt.` },
      ],
      getuigenissen: [
        { quote: `${naam} stuurde me een berichtje alleen om te zeggen dat ik geweldig ben. Mijn dag was gemaakt.`, auteur: "Dankbare vriend" },
        { quote: `Ik was verdrietig. ${naam} kwam langs met taart. Gewoon omdat.`, auteur: "Gelukkige collega" },
        { quote: `Als iedereen was als ${naam}, was de wereld perfect.`, auteur: "Iedereen" },
      ],
      faq: [
        { vraag: `Is ${naam} echt zo lief?`, antwoord: `Ja. Sterker nog: deze website doet het nog tekort. ${naam} is in het echt nog liever.` },
        { vraag: `Kan iemand liever zijn dan ${naam}?`, antwoord: `Theoretisch misschien. Maar niemand heeft het tot nu toe bewezen.` },
        { vraag: `Is deze website niet overdreven?`, antwoord: `Nee. ${naam} verdient dit. En meer. Verspreid de liefde.` },
      ],
    };
  }

  if (siteId === "lief") {
    return {
      redenen: [
        { titel: `${naam} moet echt ff lief doen`, tekst: `Het is genoeg geweest. ${naam} loopt al de hele dag chagrijnig rond. Iedereen heeft het gemerkt. Het wordt tijd voor een attitude-aanpassing.` },
        { titel: "Die opmerking was niet nodig", tekst: `We kennen het allemaal. ${naam} zegt iets en de hele kamer is stil. Niet van bewondering. Van verbazing. Was dat nou nodig?` },
        { titel: `${naam} en empathie: het is ingewikkeld`, tekst: `Empathie is een vaardigheid die de meeste mensen beheersen. ${naam} is nog in de beginfase. Heel erg in de beginfase.` },
        { titel: "Het gezucht moet stoppen", tekst: `Elke keer als iemand iets vraagt, zucht ${naam}. Alsof het een persoonlijke aanval is. Spoiler: dat is het niet. Doe ff lief.` },
        { titel: "Complimenten geven: een handleiding", tekst: `Stap 1: open je mond. Stap 2: zeg iets aardigs. ${naam} is vastgelopen bij stap 1.` },
        { titel: "Dit is een interventie", tekst: `${naam}, dit is je teken. Het universum, je vrienden, en deze website zeggen het allemaal: doe ff lief. Het is niet zo moeilijk.` },
      ],
      getuigenissen: [
        { quote: `${naam} zei 'goedemorgen' en het klonk als een dreigement.`, auteur: "Collega" },
        { quote: `Ik vroeg ${naam} hoe het ging. Het antwoord was een zucht van 8 seconden.`, auteur: "Bezorgde vriend" },
        { quote: `${naam} moet echt ff lief doen. Echt.`, auteur: "Iedereen" },
      ],
      faq: [
        { vraag: `Is ${naam} altijd zo?`, antwoord: `Helaas wel. Het is geen fase. Het is een patroon.` },
        { vraag: `Kan ${naam} lief leren doen?`, antwoord: `In theorie wel. De wetenschap is voorzichtig optimistisch. De omgeving minder.` },
        { vraag: `Is dit gemeen?`, antwoord: `${naam} is degene die ff lief moet doen, niet wij.` },
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
    ],
    faq: [
      { vraag: `Maar soms lachen mensen toch om ${naam}?`, antwoord: `Dat klopt. Dit fenomeen staat bekend als "medelachten" \u2014 een sociaal overlevingsmechanisme waarbij mensen lachen om een ongemakkelijke stilte te doorbreken. Het heeft niets met humor te maken.` },
      { vraag: `Kan ${naam} ooit grappig worden?`, antwoord: `De wetenschap is hier niet optimistisch over. Hoewel humor theoretisch aangeleerd kan worden, vereist dit een mate van zelfbewustzijn die ${naam} op dit moment niet bezit.` },
      { vraag: "Is deze website niet een beetje gemeen?", antwoord: `Deze website is een publieke dienst. Wij geloven dat eerlijkheid uiteindelijk in ieders belang is. Bovendien: als ${naam} dit leest en er om kan lachen, is dat het grappigste dat diegene ooit heeft gedaan.` },
    ],
  };
}

export function getContent(naam: string, lang: Lang = "nl", siteId: SiteId = "grappig") {
  // English content for werken site
  if (lang === "en" && siteId === "werken") {
    return {
      redenen: [
        { titel: `${naam} really needs to get a job`, tekst: `Everyone around ${naam} is being productive. ${naam}? On the couch. All day. Every day. It's structural at this point.` },
        { titel: "Netflix doesn't count as work", tekst: `${naam} claims to be doing "research," but the watchlist tells a different story. Eight seasons in one week is not a resume bullet point.` },
        { titel: "The alarm goes off, but work doesn't", tekst: `Every morning ${naam}'s alarm rings at 7 AM. By 7:01 the snooze button has been pressed. Work starts... tomorrow.` },
        { titel: `${naam}'s excuses are legendary`, tekst: `"I'm waiting for inspiration." "I work better under pressure." "I'm focusing on personal growth." Spoiler: the growth has stalled.` },
        { titel: "Productivity: an abstract concept", tekst: `If productivity were a sport, ${naam} wouldn't even be in the stadium. Maybe in the parking garage. Sleeping.` },
        { titel: "It's really time", tekst: `Dear ${naam}, this is not a joke. Get. A. Job. Society is waiting. So is your bank account.` },
      ],
      statistieken: randomStats(naam, "en", siteId),
      getuigenissen: [
        { quote: `${naam} asked me when the deadline was. It was yesterday.`, auteur: "Project manager" },
        { quote: `I once saw ${naam} working. It was by accident.`, auteur: "Colleague" },
        { quote: `${naam}'s LinkedIn says 'hard worker'. I have evidence to the contrary.`, auteur: "Former employer" },
      ],
      faq: [
        { vraag: `Does ${naam} really never work?`, antwoord: `Sometimes. But by that we mean opening the laptop to start Netflix.` },
        { vraag: `Can ${naam} change?`, antwoord: `In theory, yes. But the couch is comfortable and motivation is nowhere to be found.` },
        { vraag: "Isn't this website a bit mean?", antwoord: `This is an intervention. Sometimes the truth needs a website.` },
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
      ],
      faq: [
        { vraag: `But sometimes people do laugh at ${naam}?`, antwoord: `That's correct. This phenomenon is known as "sympathy laughing" \u2014 a social survival mechanism where people laugh to break an awkward silence. It has nothing to do with humor.` },
        { vraag: `Can ${naam} ever become funny?`, antwoord: `Science is not optimistic about this. While humor can theoretically be learned, it requires a level of self-awareness that ${naam} currently does not possess.` },
        { vraag: "Isn't this website a bit mean?", antwoord: `This website is a public service. We believe that honesty is ultimately in everyone's best interest. Besides: if ${naam} reads this and can laugh about it, that would be the funniest thing they've ever done.` },
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
        subtitle: "A public service announcement",
        before: ", you should be",
        highlight: "working",
        after: "",
        description: "This website was created to inform the world about an uncomfortable truth that has been kept quiet for far too long.",
        cta: "See the evidence",
      },
      stats: { heading: "The numbers don't lie" },
      reasons: {
        heading: "Scientifically proven",
        subheading: (naam: string) => `6 reasons why ${naam} should be working`,
      },
      testimonials: { heading: "Eyewitness accounts", subheading: "What others say" },
      faqSection: { heading: "Frequently asked questions", subheading: "FAQ" },
      share: {
        heading: "Know someone else who should be working?",
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
        title: "Who should be",
        highlight: "working",
        after: "?",
        description: "Enter a name and discover the scientific evidence.",
        placeholder: "Enter a name...",
        button: "Prove it",
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

  return {
    hero: {
      subtitle: "Een publieke dienstaankondiging",
      before: phraseParts.before,
      highlight: phraseParts.highlight,
      after: phraseParts.after,
      description: `Deze website is opgezet om de wereld te informeren over een ongemakkelijke waarheid die al veel te lang verzwegen wordt.`,
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
    share: {
      heading: site.share.heading,
      description: site.share.description,
      shareButton: () => `Deel via WhatsApp`,
      copied: "Link gekopieerd!",
      copyLink: "Kopieer link",
      create: siteId === "liefste" ? "Kies een nieuwe lieverd" : "Kies een nieuw slachtoffer",
      shareText: (naam: string) => site.share.whatsappText(naam),
    },
    footer: {
      stichting: () => `Dit is satire. Geen zorgen, geen rechtszaken.`,
      disclaimer: (naam: string) => `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun ego.`,
    },
    landing: {
      subtitle: site.landing.subtitle,
      title: site.landing.title,
      highlight: phraseParts.highlight,
      after: phraseParts.after ? `${phraseParts.after}?` : "?",
      description: site.landing.description,
      placeholder: site.landing.placeholder,
      button: site.landing.button,
    },
  };
}
