import { Metadata } from "next";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ names?: string; scores?: string; lang?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { names: namesParam, scores: scoresParam, lang: langParam } = await searchParams;
  const isEN = langParam === "en";

  const names = (namesParam || "").split(",").filter(Boolean);
  const scores = (scoresParam || "").split(",").map(Number);

  const capitalize = (s: string) =>
    s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  const winner = names[0] ? capitalize(names[0]) : "Iemand";
  const winnerScore = scores[0] || 0;

  const title = isEN
    ? `${winner} is the least funny!`
    : `${winner} is het minst grappig!`;

  const description = isEN
    ? `With ${winnerScore} views, ${winner} takes the crown. Who do you know that's even less funny?`
    : `Met ${winnerScore}x bekeken pakt ${winner} de kroon. Ken jij iemand die nog minder grappig is?`;

  const baseUrl = isEN ? "https://isntfunny.com" : "https://isnietgrappig.com";
  const pageUrl = `${baseUrl}/battle?names=${encodeURIComponent(namesParam || "")}&scores=${encodeURIComponent(scoresParam || "")}&lang=${langParam || "nl"}`;
  const ogImageUrl = `${baseUrl}/api/og/battle?names=${encodeURIComponent(namesParam || "")}&scores=${encodeURIComponent(scoresParam || "")}&lang=${langParam || "nl"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: isEN ? "Is Not Funny" : "Is Niet Grappig",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: isEN ? "en_US" : "nl_NL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function BattlePage({ searchParams }: Props) {
  const { names: namesParam, scores: scoresParam, lang: langParam } = await searchParams;
  const isEN = langParam === "en";

  const names = (namesParam || "").split(",").filter(Boolean);
  const scores = (scoresParam || "").split(",").map(Number);

  const capitalize = (s: string) =>
    s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  const results = names.map((name, i) => ({
    name: capitalize(name),
    score: scores[i] || 0,
  }));

  const winner = results[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-3xl">🔥</span>
          <h1 className="text-xl font-bold text-amber-400 uppercase tracking-wider">
            {isEN ? "Battle Results" : "Battle Resultaten"}
          </h1>
        </div>

        {/* Winner */}
        {winner && (
          <div className="mb-8">
            <p className="text-sm text-zinc-500 mb-2">
              {isEN ? "Least funny:" : "Minst grappig:"}
            </p>
            <p className="text-4xl font-black text-amber-400 mb-2">
              {winner.name}
            </p>
            <p className="text-zinc-500">
              {winner.score}x {isEN ? "views" : "bekeken"}
            </p>
          </div>
        )}

        {/* Leaderboard */}
        {results.length > 1 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 mb-8">
            <div className="space-y-2">
              {results.slice(1).map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0"
                >
                  <span className="text-zinc-400">
                    <span className="text-zinc-600 mr-3">{i + 2}.</span>
                    {r.name}
                    {r.name.toLowerCase() === "dennis" && (
                      <span className="text-zinc-600 italic text-sm ml-2">(seriously? wat denk je zelf)</span>
                    )}
                  </span>
                  <span className="text-zinc-600">{r.score}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA - continue the loop */}
        <div className="space-y-4">
          <p className="text-zinc-500 text-sm">
            {isEN
              ? "Know someone who's even less funny?"
              : "Ken jij iemand die nog minder grappig is?"}
          </p>
          <Link
            href={isEN ? "/?lang=en" : "/"}
            className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-all hover:bg-red-500"
          >
            {isEN ? "Choose your next victim" : "Kies je volgende slachtoffer"}
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-zinc-700">
          {isEN ? "isntfunny.com" : "isnietgrappig.com"}
        </p>
      </div>
    </div>
  );
}
