import { Metadata } from "next";
import { getUI, Lang } from "@/lib/content";
import NameForm from "@/components/NameForm";
import LanguageToggle from "@/components/LanguageToggle";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const isEN = langParam === "en";

  return {
    title: isEN ? "Is Not Funny" : "Is Niet Grappig",
    description: isEN
      ? "Discover the scientific evidence that someone is not funny."
      : "Ontdek het wetenschappelijk bewijs dat iemand niet grappig is.",
  };
}

export default async function LandingPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === "en" ? "en" : "nl";
  const ui = getUI(lang).landing;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col items-center justify-center px-6">
      <LanguageToggle lang={lang} />
      <div className="animate-fade-in-up text-center max-w-lg">
        <p className="mb-4 text-sm font-mono uppercase tracking-[0.3em] text-zinc-500">
          {ui.subtitle}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {ui.title}{" "}
          <span className="animate-pulse-red font-black">{ui.not}</span>{" "}
          {ui.funny}
        </h1>
        <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
          {ui.description}
        </p>
        <NameForm placeholder={ui.placeholder} button={ui.button} lang={lang} />
      </div>
    </div>
  );
}
