export default function Home() {
  const redenen = [
    {
      titel: "Timing is alles, en Niek heeft het niet",
      tekst: "Een goede grap draait om timing. Niek levert de punchline consequent op het verkeerde moment af. Als comedy een muziekinstrument was, speelt Niek constant uit de maat.",
    },
    {
      titel: "Recycling is goed voor het milieu, niet voor grappen",
      tekst: "Niek vertelt dezelfde grap meerdere keren alsof het de eerste keer al niet pijnlijk genoeg was. Herhaling kan komisch zijn als het bewust wordt ingezet. Bij Niek is het gewoon een geheugenprobleem.",
    },
    {
      titel: "De 'moet je luisteren'-opening",
      tekst: "Als iemand begint met 'moet je luisteren, dit is echt grappig', weet je dat het niet grappig gaat worden. Niek doet dit elke keer. Het is de komische equivalent van een spoiler alert voor teleurstelling.",
    },
    {
      titel: "Het eigen-lach-syndroom",
      tekst: "Niek lacht harder om zijn eigen grappen dan wie dan ook in de ruimte. Dit is wetenschappelijk bewezen een teken dat de grap niet sterk genoeg is om op eigen benen te staan.",
    },
    {
      titel: "Woordgrappen op het verkeerde niveau",
      tekst: "Er zijn goede woordgrappen en er zijn Niek-woordgrappen. Het verschil? Bij goede woordgrappen kreun je van bewondering. Bij Niek-woordgrappen kreun je van pijn.",
    },
    {
      titel: "De eindeloze context",
      tekst: "Voordat Niek bij de clou komt, geeft hij eerst 15 minuten achtergrondinformatie. Tegen de tijd dat de punchline valt, is iedereen vergeten waar het verhaal over ging. Inclusief Niek zelf.",
    },
  ];

  const statistieken = [
    { label: "Mislukte grappen per dag", waarde: "47" },
    { label: "Mensen die uit beleefdheid lachen", waarde: "98%" },
    { label: "Grappen die herhaling zijn", waarde: "84%" },
    { label: "Seconden stilte na een grap", waarde: "∞" },
  ];

  const getuigenissen = [
    {
      quote: "Ik dacht dat hij een vraag stelde. Blijkbaar was het een grap.",
      auteur: "Anonieme collega",
    },
    {
      quote:
        "Niek vertelde een grap op een feestje. Het feestje was daarna afgelopen.",
      auteur: "Ex-feestganger",
    },
    {
      quote:
        "Ik heb een keer gelachen om een grap van Niek. Achteraf bleek ik te lachen om iets anders.",
      auteur: "Vriend van een vriend",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent" />
        <div className="relative z-10 animate-fade-in-up">
          <p className="mb-4 text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            Een publieke dienstaankondiging
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
            Niek is{" "}
            <span className="animate-pulse-red font-black">niet</span>{" "}
            grappig
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-zinc-400 leading-relaxed">
            Deze website is opgezet om de wereld te informeren over een
            ongemakkelijke waarheid die al veel te lang verzwegen wordt.
          </p>
          <div className="mt-10">
            <a
              href="#bewijs"
              className="inline-block rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Bekijk het bewijs
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 animate-bounce text-zinc-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Statistieken */}
      <section className="border-t border-zinc-800 bg-zinc-950/50 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            De cijfers liegen niet
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {statistieken.map((stat, i) => (
              <div
                key={i}
                className="animate-counter text-center"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="text-4xl font-black text-red-500 sm:text-5xl">
                  {stat.waarde}
                </div>
                <div className="mt-2 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redenen */}
      <section id="bewijs" className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            Wetenschappelijk onderbouwd
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">
            6 redenen waarom Niek niet grappig is
          </h3>
          <div className="mt-16 space-y-12">
            {redenen.map((reden, i) => (
              <div
                key={i}
                className="animate-slide-in group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-zinc-600 hover:bg-zinc-900"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-lg font-bold text-red-500">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-xl font-semibold">{reden.titel}</h4>
                    <p className="mt-3 text-zinc-400 leading-relaxed">
                      {reden.tekst}
                    </p>
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
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            Ooggetuigenverslagen
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">
            Wat anderen zeggen
          </h3>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {getuigenissen.map((getuigenis, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-600"
              >
                <svg
                  className="mb-4 h-8 w-8 text-zinc-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-zinc-300 italic leading-relaxed">
                  &ldquo;{getuigenis.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-500">
                  &mdash; {getuigenis.auteur}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            Veelgestelde vragen
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">FAQ</h3>
          <div className="mt-16 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 className="font-semibold">
                Maar soms lachen mensen toch om Niek?
              </h4>
              <p className="mt-2 text-zinc-400">
                Dat klopt. Dit fenomeen staat bekend als &quot;medelachten&quot;
                &mdash; een sociaal overlevingsmechanisme waarbij mensen lachen
                om een ongemakkelijke stilte te doorbreken. Het heeft niets met
                humor te maken.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 className="font-semibold">
                Kan Niek ooit grappig worden?
              </h4>
              <p className="mt-2 text-zinc-400">
                De wetenschap is hier niet optimistisch over. Hoewel humor
                theoretisch aangeleerd kan worden, vereist dit een mate van
                zelfbewustzijn die Niek op dit moment niet bezit.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h4 className="font-semibold">
                Is deze website niet een beetje gemeen?
              </h4>
              <p className="mt-2 text-zinc-400">
                Deze website is een publieke dienst. Wij geloven dat eerlijkheid
                uiteindelijk in ieders belang is. Bovendien: als Niek dit leest
                en er om kan lachen, is dat het grappigste dat hij ooit heeft
                gedaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6 text-center">
        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} Stichting Niek Is Niet Grappig.
          Alle rechten voorbehouden.
        </p>
        <p className="mt-2 text-xs text-zinc-700">
          Geen Nieks zijn beschadigd bij het maken van deze website. Alleen hun
          ego.
        </p>
      </footer>
    </div>
  );
}
