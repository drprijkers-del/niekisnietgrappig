import { Metadata } from "next";
import { notFound } from "next/navigation";
import { capitalizeName } from "@/lib/utils";
import { getContent, getUI, Lang } from "@/lib/content";
import ShareButtons from "@/components/ShareButtons";
import ShareButton from "@/components/ShareButton";
import LanguageToggle from "@/components/LanguageToggle";
import TopShared from "@/components/TopShared";

type Props = {
  params: Promise<{ naam: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { naam: rawNaam } = await params;
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === "en" ? "en" : "nl";
  const naam = capitalizeName(rawNaam);

  const isEN = lang === "en";

  return {
    title: isEN
      ? `${naam} Is Not Funny`
      : `${naam} Is Niet Grappig`,
    description: isEN
      ? `A scientifically backed website about why ${naam} is not funny.`
      : `Een wetenschappelijk onderbouwde website over waarom ${naam} niet grappig is.`,
    openGraph: {
      title: isEN
        ? `${naam} is not funny`
        : `${naam} is niet grappig`,
      description: isEN
        ? `The proof is here. ${naam} is not funny and it's now official.`
        : `Het bewijs is hier. ${naam} is niet grappig en dat is nu officieel.`,
      siteName: isEN ? "Is Not Funny" : "Is Niet Grappig",
      images: [
        {
          url: `/api/og?naam=${encodeURIComponent(rawNaam)}&lang=${lang}`,
          width: 1200,
          height: 630,
          alt: isEN
            ? `${naam} is not funny`
            : `${naam} is niet grappig`,
        },
      ],
      locale: isEN ? "en_US" : "nl_NL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isEN
        ? `${naam} is not funny`
        : `${naam} is niet grappig`,
      description: isEN
        ? `The proof is here. ${naam} is not funny.`
        : `Het bewijs is hier. ${naam} is niet grappig.`,
      images: [`/api/og?naam=${encodeURIComponent(rawNaam)}&lang=${lang}`],
    },
  };
}

export default async function NaamPage({ params, searchParams }: Props) {
  const { naam: rawNaam } = await params;
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === "en" ? "en" : "nl";

  const decoded = decodeURIComponent(rawNaam);
  if (decoded.length > 50 || !/^[\p{L}\s'.-]+$/u.test(decoded)) {
    notFound();
  }

  const naam = capitalizeName(rawNaam);
  const { redenen, statistieken, getuigenissen, faq } = getContent(naam, lang);
  const ui = getUI(lang);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <LanguageToggle lang={lang} />

      {/* Hero */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent" />
        <div className="absolute top-20 sm:top-8 left-0 right-0 z-10 flex justify-center">
          <TopShared lang={lang} />
        </div>
        <div className="relative z-10 animate-fade-in-up">
          <p className="mb-4 text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            {ui.hero.subtitle}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-7xl md:text-8xl landscape:text-3xl landscape:sm:text-5xl">
            {naam} {ui.hero.is}{" "}
            <span className="animate-pulse-red font-black">{ui.hero.not}</span>{" "}
            {ui.hero.funny}
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-zinc-400 leading-relaxed">
            {ui.hero.description}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-3">
            <a
              href="#bewijs"
              className="inline-block rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium transition-all hover:bg-white hover:text-black hover:border-white"
            >
              {ui.hero.cta}
            </a>
            <ShareButton
              naam={naam}
              lang={lang}
              label={ui.share.shareButton()}
            />
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
            {ui.stats.heading}
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
            {ui.reasons.heading}
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">
            {ui.reasons.subheading(naam)}
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
            {ui.testimonials.heading}
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">
            {ui.testimonials.subheading}
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
            {ui.faqSection.heading}
          </h2>
          <h3 className="text-center text-3xl font-bold sm:text-4xl">
            {ui.faqSection.subheading}
          </h3>
          <div className="mt-16 space-y-6">
            {faq.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <h4 className="font-semibold">{item.vraag}</h4>
                <p className="mt-2 text-zinc-400">{item.antwoord}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <ShareButtons naam={naam} lang={lang} />

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6 text-center">
        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} {ui.footer.stichting()}
        </p>
        <p className="mt-2 text-xs text-zinc-700">
          {ui.footer.disclaimer(naam)}
        </p>
        <p className="mt-1 text-[10px] text-zinc-800 italic">
          Where it all satisfyingly began: Niek.
        </p>
        <p className="mt-6 text-xs text-zinc-600">
          Made by{" "}
          <a
            href="https://www.pinkpollos.com/nl/lab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-white"
          >
            Pink Pollos
          </a>
        </p>
      </footer>
    </div>
  );
}
