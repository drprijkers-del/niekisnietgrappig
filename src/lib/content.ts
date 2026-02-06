import { hashString, seededRng } from "./utils";

export type Lang = "nl" | "en";

// Custom subtitles for specific friends — only shown for exact name matches
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
 * Returns null for names without a custom subtitle.
 */
export function getCustomSubtitle(naam: string): string | null {
  const key = naam.toLowerCase().trim();
  return CUSTOM_SUBTITLES[key] ?? null;
}

function randomStats(naam: string, lang: Lang) {
  const rng = seededRng(hashString(`stats|${naam}|${lang}`));
  const r = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;

  const failed = r(23, 89);
  const polite = r(89, 99);
  const repeats = r(61, 96);
  const silence = (rng() * 8 + 3.5).toFixed(1); // 3.5 - 11.5 sec

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

export function getContent(naam: string, lang: Lang = "nl") {
  if (lang === "en") {
    return {
      redenen: [
        {
          titel: `Timing is everything, and ${naam} doesn't have it`,
          tekst: `A good joke is all about timing. ${naam} consistently delivers the punchline at the wrong moment. If comedy were a musical instrument, ${naam} would be permanently off-beat.`,
        },
        {
          titel: "Recycling is great for the planet, not for jokes",
          tekst: `${naam} tells the same joke multiple times as if the first time wasn't painful enough. Repetition can be comedic when used intentionally. With ${naam}, it's just a memory problem.`,
        },
        {
          titel: "The 'listen, this is really funny' opener",
          tekst: `When someone starts with 'listen, this is really funny', you know it's not going to be funny. ${naam} does this every single time. It's the comedic equivalent of a spoiler alert for disappointment.`,
        },
        {
          titel: "The self-laugh syndrome",
          tekst: `${naam} laughs harder at their own jokes than anyone else in the room. This is scientifically proven to be a sign that the joke isn't strong enough to stand on its own.`,
        },
        {
          titel: "Puns at the wrong level",
          tekst: `There are good puns and there are ${naam}-puns. The difference? Good puns make you groan in admiration. ${naam}-puns make you groan in pain.`,
        },
        {
          titel: "The endless context",
          tekst: `Before ${naam} gets to the punchline, there's first 15 minutes of background information. By the time the punchline drops, everyone has forgotten what the story was about. Including ${naam}.`,
        },
      ],
      statistieken: randomStats(naam, "en"),
      getuigenissen: [
        {
          quote: "I thought it was a question. Apparently it was a joke.",
          auteur: "Anonymous colleague",
        },
        {
          quote: `${naam} told a joke at a party. The party was over after that.`,
          auteur: "Former party-goer",
        },
        {
          quote: `I once laughed at a joke from ${naam}. Turns out I was laughing at something else.`,
          auteur: "Friend of a friend",
        },
      ],
      faq: [
        {
          vraag: `But sometimes people do laugh at ${naam}?`,
          antwoord: `That's correct. This phenomenon is known as "sympathy laughing" \u2014 a social survival mechanism where people laugh to break an awkward silence. It has nothing to do with humor.`,
        },
        {
          vraag: `Can ${naam} ever become funny?`,
          antwoord: `Science is not optimistic about this. While humor can theoretically be learned, it requires a level of self-awareness that ${naam} currently does not possess.`,
        },
        {
          vraag: "Isn't this website a bit mean?",
          antwoord: `This website is a public service. We believe that honesty is ultimately in everyone's best interest. Besides: if ${naam} reads this and can laugh about it, that would be the funniest thing they've ever done.`,
        },
      ],
    };
  }

  return {
    redenen: [
      {
        titel: `Timing is alles, en ${naam} heeft het niet`,
        tekst: `Een goede grap draait om timing. ${naam} levert de punchline consequent op het verkeerde moment af. Als comedy een muziekinstrument was, speelt ${naam} constant uit de maat.`,
      },
      {
        titel: "Recycling is goed voor het milieu, niet voor grappen",
        tekst: `${naam} vertelt dezelfde grap meerdere keren alsof het de eerste keer al niet pijnlijk genoeg was. Herhaling kan komisch zijn als het bewust wordt ingezet. Bij ${naam} is het gewoon een geheugenprobleem.`,
      },
      {
        titel: "De 'moet je luisteren'-opening",
        tekst: `Als iemand begint met 'moet je luisteren, dit is echt grappig', weet je dat het niet grappig gaat worden. ${naam} doet dit elke keer. Het is de komische equivalent van een spoiler alert voor teleurstelling.`,
      },
      {
        titel: "Het eigen-lach-syndroom",
        tekst: `${naam} lacht harder om de eigen grappen dan wie dan ook in de ruimte. Dit is wetenschappelijk bewezen een teken dat de grap niet sterk genoeg is om op eigen benen te staan.`,
      },
      {
        titel: "Woordgrappen op het verkeerde niveau",
        tekst: `Er zijn goede woordgrappen en er zijn ${naam}-woordgrappen. Het verschil? Bij goede woordgrappen kreun je van bewondering. Bij ${naam}-woordgrappen kreun je van pijn.`,
      },
      {
        titel: "De eindeloze context",
        tekst: `Voordat ${naam} bij de clou komt, volgt er eerst 15 minuten achtergrondinformatie. Tegen de tijd dat de punchline valt, is iedereen vergeten waar het verhaal over ging. Inclusief ${naam} zelf.`,
      },
    ],
    statistieken: randomStats(naam, "nl"),
    getuigenissen: [
      {
        quote: "Ik dacht dat het een vraag was. Blijkbaar was het een grap.",
        auteur: "Anonieme collega",
      },
      {
        quote: `${naam} vertelde een grap op een feestje. Het feestje was daarna afgelopen.`,
        auteur: "Ex-feestganger",
      },
      {
        quote: `Ik heb een keer gelachen om een grap van ${naam}. Achteraf bleek ik te lachen om iets anders.`,
        auteur: "Vriend van een vriend",
      },
    ],
    faq: [
      {
        vraag: `Maar soms lachen mensen toch om ${naam}?`,
        antwoord: `Dat klopt. Dit fenomeen staat bekend als "medelachten" \u2014 een sociaal overlevingsmechanisme waarbij mensen lachen om een ongemakkelijke stilte te doorbreken. Het heeft niets met humor te maken.`,
      },
      {
        vraag: `Kan ${naam} ooit grappig worden?`,
        antwoord: `De wetenschap is hier niet optimistisch over. Hoewel humor theoretisch aangeleerd kan worden, vereist dit een mate van zelfbewustzijn die ${naam} op dit moment niet bezit.`,
      },
      {
        vraag: "Is deze website niet een beetje gemeen?",
        antwoord: `Deze website is een publieke dienst. Wij geloven dat eerlijkheid uiteindelijk in ieders belang is. Bovendien: als ${naam} dit leest en er om kan lachen, is dat het grappigste dat diegene ooit heeft gedaan.`,
      },
    ],
  };
}

export function getUI(lang: Lang = "nl") {
  if (lang === "en") {
    return {
      hero: {
        subtitle: "A public service announcement",
        is: "is",
        not: "not",
        funny: "funny",
        description:
          "This website was created to inform the world about an uncomfortable truth that has been kept quiet for far too long.",
        cta: "See the evidence",
      },
      stats: { heading: "The numbers don't lie" },
      reasons: {
        heading: "Scientifically proven",
        subheading: (naam: string) => `6 reasons why ${naam} is not funny`,
      },
      testimonials: {
        heading: "Eyewitness accounts",
        subheading: "What others say",
      },
      faqSection: { heading: "Frequently asked questions", subheading: "FAQ" },
      share: {
        heading: "Know someone else who isn't funny?",
        description: "Spread the truth or pick your next victim.",
        shareButton: () => `Share via WhatsApp`,
        copied: "Link copied!",
        copyLink: "Copy link",
        create: "Pick a new victim",
        shareText: (naam: string) =>
          `Lmaooo ${naam} look 😂`,
      },
      footer: {
        stichting: () =>
          `This is satire. Please don't sue us.`,
        disclaimer: (naam: string) =>
          `No one named ${naam} was harmed in the making of this website. Only their ego.`,
      },
      landing: {
        subtitle: "A public service announcement",
        title: "Who is",
        not: "not",
        funny: "funny?",
        description:
          "Enter a name and discover the scientific evidence.",
        placeholder: "Enter a name...",
        button: "Prove it",
      },
    };
  }

  return {
    hero: {
      subtitle: "Een publieke dienstaankondiging",
      is: "is",
      not: "niet",
      funny: "grappig",
      description:
        "Deze website is opgezet om de wereld te informeren over een ongemakkelijke waarheid die al veel te lang verzwegen wordt.",
      cta: "Bekijk het bewijs",
    },
    stats: { heading: "De cijfers liegen niet" },
    reasons: {
      heading: "Wetenschappelijk onderbouwd",
      subheading: (naam: string) => `6 redenen waarom ${naam} niet grappig is`,
    },
    testimonials: {
      heading: "Ooggetuigenverslagen",
      subheading: "Wat anderen zeggen",
    },
    faqSection: { heading: "Veelgestelde vragen", subheading: "FAQ" },
    share: {
      heading: "Ken jij ook iemand die niet grappig is?",
      description: "Verspreid de waarheid of kies je volgende slachtoffer.",
      shareButton: () => `Deel via WhatsApp`,
      copied: "Link gekopieerd!",
      copyLink: "Kopieer link",
      create: "Kies een nieuw slachtoffer",
      shareText: (naam: string) =>
        `Hahaha ${naam} kijk 😂`,
    },
    footer: {
      stichting: () =>
        `Dit is satire. Geen zorgen, geen rechtszaken.`,
      disclaimer: (naam: string) =>
        `Geen enkele ${naam} is beschadigd bij het maken van deze website. Alleen hun ego.`,
    },
    landing: {
      subtitle: "Een publieke dienstaankondiging",
      title: "Wie is",
      not: "niet",
      funny: "grappig?",
      description: "Vul een naam in en ontdek het wetenschappelijk bewijs.",
      placeholder: "Vul een naam in...",
      button: "Bewijs het",
    },
  };
}
