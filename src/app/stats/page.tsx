import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CopyDashboardLink from "./CopyDashboardLink";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
};

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function parse(raw: string[]) {
  const result: { naam: string; count: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    result.push({ naam: raw[i], count: Number(raw[i + 1]) });
  }
  return result;
}

function capitalize(s: string) {
  return s.replace(/(^|[\s'-])(\S)/g, (_, sep, c) => sep + c.toUpperCase());
}

type Props = {
  searchParams: Promise<{ key?: string }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!key || key !== process.env.STATS_SECRET) {
    redirect("/");
  }

  const redis = getRedis();
  const [viewsRaw, sharesRaw, refsRaw] = await Promise.all([
    redis.zrange<string[]>("views:leaderboard", 0, 49, {
      rev: true,
      withScores: true,
    }),
    redis.zrange<string[]>("shares:leaderboard", 0, 49, {
      rev: true,
      withScores: true,
    }),
    redis.zrange<string[]>("refs:leaderboard", 0, -1, {
      rev: true,
      withScores: true,
    }),
  ]);

  const views = parse(viewsRaw || []);
  const shares = parse(sharesRaw || []);
  const refs = parse(refsRaw || []);

  const totalViews = views.reduce((sum, v) => sum + v.count, 0);
  const totalShares = shares.reduce((sum, s) => sum + s.count, 0);
  const totalRefs = refs.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Is Niet Grappig &mdash; live stats</p>
          </div>
          <div className="flex items-center gap-3">
            <CopyDashboardLink />
            <a
              href="/"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              &larr; Home
            </a>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-12">
          <Card label="Total views" value={totalViews.toLocaleString()} />
          <Card label="Total shares" value={totalShares.toLocaleString()} />
          <Card label="Unique names" value={views.length.toString()} />
          <Card label="Ref clicks" value={totalRefs.toLocaleString()} />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Views */}
          <section>
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Top Views
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Views</th>
                    <th className="px-4 py-3 text-right font-medium sr-only">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {views.map((v, i) => (
                    <tr key={v.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-600">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <a
                          href={`https://${v.naam}.isnietgrappig.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-400 transition-colors"
                        >
                          {capitalize(v.naam)}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                        {v.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 w-24">
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${(v.count / (views[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {views.length === 0 && (
                <p className="px-4 py-8 text-center text-zinc-600">No data yet</p>
              )}
            </div>
          </section>

          {/* Shares */}
          <section>
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Top Shares
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Shares</th>
                    <th className="px-4 py-3 text-right font-medium sr-only">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {shares.map((s, i) => (
                    <tr key={s.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-600">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{capitalize(s.naam)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                        {s.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 w-24">
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{
                              width: `${(s.count / (shares[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shares.length === 0 && (
                <p className="px-4 py-8 text-center text-zinc-600">No data yet</p>
              )}
            </div>
          </section>
        </div>

        {/* Referrals */}
        <section className="mt-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Traffic Sources
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {refs.length > 0 ? (
              refs.map((r) => (
                <div
                  key={r.naam}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"
                >
                  <div className="text-2xl font-bold tabular-nums">
                    {r.count.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wide">
                    {refLabel(r.naam)}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-zinc-600 py-4">
                No referral data yet &mdash; new shares will start tracking
              </p>
            )}
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-700">
          Data refreshes on every page load &middot; Bookmark this page for quick access
        </footer>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function refLabel(ref: string) {
  const labels: Record<string, string> = {
    wa: "WhatsApp",
    copy: "Copied link",
    x: "X / Twitter",
    ig: "Instagram",
    tiktok: "TikTok",
    fb: "Facebook",
    email: "Email",
  };
  return labels[ref] || ref;
}
