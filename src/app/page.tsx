import { Metadata } from "next";
import { getUI, Lang } from "@/lib/content";
import NameForm from "@/components/NameForm";
import LanguageToggle from "@/components/LanguageToggle";
import { getCurrentSite } from "@/lib/sites";
import SiteDiscovery from "@/components/SiteDiscovery";
import { getKoningsdagFromCookies, getKoningsdagLanding, KONINGSDAG_ACCENT } from "@/lib/koningsdag";
import KoningsdagBanner from "@/components/KoningsdagBanner";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const site = await getCurrentSite();
  const lang: Lang = langParam === "en" && site.hasEnglish ? "en" : "nl";
  const ui = getUI(lang, site.siteId);

  const title = lang === "en"
    ? `${ui.landing.title} ${ui.landing.highlight} ${ui.landing.after}`.replace(/\?/g, "").trim()
    : site.meta.defaultTitle;
  const description = lang === "en"
    ? ui.landing.description
    : site.meta.description;

  return { title, description };
}

export default async function LandingPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const site = await getCurrentSite();
  const lang: Lang = langParam === "en" && site.hasEnglish ? "en" : "nl";
  const baseUi = getUI(lang, site.siteId).landing;
  const isKoningsdag = await getKoningsdagFromCookies(site.siteId);
  const kdLanding = isKoningsdag ? getKoningsdagLanding(site.siteId) : null;
  const ui = kdLanding ?? baseUi;
  const highlightStyle = isKoningsdag ? { color: KONINGSDAG_ACCENT } : undefined;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col">
      {isKoningsdag && <KoningsdagBanner />}
      {site.hasEnglish && <LanguageToggle lang={lang} />}
      {isKoningsdag && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] z-0"
          style={{ background: `radial-gradient(ellipse at top, ${KONINGSDAG_ACCENT}22, transparent 60%)` }}
          aria-hidden="true"
        />
      )}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        <div className="animate-fade-in-up text-center max-w-lg">
          <p className="mb-4 text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
            {ui.subtitle}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {ui.title}{" "}
            <span className="animate-pulse-red font-black" style={highlightStyle}>
              {ui.highlight}
            </span>{" "}
            {ui.after}
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            {ui.description}
          </p>
          <NameForm placeholder={ui.placeholder} button={ui.button} lang={lang} siteId={site.siteId} isKoningsdag={isKoningsdag} />
          {kdLanding && (
            <p className="mt-8 text-xs font-mono uppercase tracking-[0.25em] text-orange-300/70">
              {kdLanding.footNote}
            </p>
          )}
        </div>
      </div>
      <SiteDiscovery lang={lang} siteId={site.siteId} compact isKoningsdag={isKoningsdag} />
    </div>
  );
}
