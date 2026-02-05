export type Lang = "nl" | "en";

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
          tekst: `${naam} laughs harder at his own jokes than anyone else in the room. This is scientifically proven to be a sign that the joke isn't strong enough to stand on its own.`,
        },
        {
          titel: "Puns at the wrong level",
          tekst: `There are good puns and there are ${naam}-puns. The difference? Good puns make you groan in admiration. ${naam}-puns make you groan in pain.`,
        },
        {
          titel: "The endless context",
          tekst: `Before ${naam} gets to the punchline, he first provides 15 minutes of background information. By the time the punchline drops, everyone has forgotten what the story was about. Including ${naam}.`,
        },
      ],
      statistieken: [
        { label: "Failed jokes per day", waarde: "47" },
        { label: "People laughing out of politeness", waarde: "98%" },
        { label: "Jokes that are repeats", waarde: "84%" },
        { label: "Seconds of silence after a joke", waarde: "\u221E" },
      ],
      getuigenissen: [
        {
          quote: "I thought he was asking a question. Apparently it was a joke.",
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
          antwoord: `This website is a public service. We believe that honesty is ultimately in everyone's best interest. Besides: if ${naam} reads this and can laugh about it, that would be the funniest thing he's ever done.`,
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
        tekst: `${naam} lacht harder om zijn eigen grappen dan wie dan ook in de ruimte. Dit is wetenschappelijk bewezen een teken dat de grap niet sterk genoeg is om op eigen benen te staan.`,
      },
      {
        titel: "Woordgrappen op het verkeerde niveau",
        tekst: `Er zijn goede woordgrappen en er zijn ${naam}-woordgrappen. Het verschil? Bij goede woordgrappen kreun je van bewondering. Bij ${naam}-woordgrappen kreun je van pijn.`,
      },
      {
        titel: "De eindeloze context",
        tekst: `Voordat ${naam} bij de clou komt, geeft hij eerst 15 minuten achtergrondinformatie. Tegen de tijd dat de punchline valt, is iedereen vergeten waar het verhaal over ging. Inclusief ${naam} zelf.`,
      },
    ],
    statistieken: [
      { label: "Mislukte grappen per dag", waarde: "47" },
      { label: "Mensen die uit beleefdheid lachen", waarde: "98%" },
      { label: "Grappen die herhaling zijn", waarde: "84%" },
      { label: "Seconden stilte na een grap", waarde: "\u221E" },
    ],
    getuigenissen: [
      {
        quote: "Ik dacht dat hij een vraag stelde. Blijkbaar was het een grap.",
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
        antwoord: `Deze website is een publieke dienst. Wij geloven dat eerlijkheid uiteindelijk in ieders belang is. Bovendien: als ${naam} dit leest en er om kan lachen, is dat het grappigste dat hij ooit heeft gedaan.`,
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
        description: "Share the evidence or create your own page.",
        shareButton: (naam: string) => `Share about ${naam}`,
        copied: "Link copied!",
        create: "Create your own",
        shareText: (naam: string) =>
          `${naam} is not funny. The proof is here:`,
      },
      footer: {
        stichting: (naam: string) =>
          `Foundation ${naam} Is Not Funny. All rights reserved.`,
        disclaimer: (naam: string) =>
          `No ${naam}s were harmed in the making of this website. Only their ego.`,
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
      description: "Deel het bewijs of maak een eigen pagina aan.",
      shareButton: (naam: string) => `Deel over ${naam}`,
      copied: "Link gekopieerd!",
      create: "Maak je eigen aan",
      shareText: (naam: string) =>
        `${naam} is niet grappig. Het bewijs is hier:`,
    },
    footer: {
      stichting: (naam: string) =>
        `Stichting ${naam} Is Niet Grappig. Alle rechten voorbehouden.`,
      disclaimer: (naam: string) =>
        `Geen ${naam}s zijn beschadigd bij het maken van deze website. Alleen hun ego.`,
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
