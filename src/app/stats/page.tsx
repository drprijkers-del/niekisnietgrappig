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
  const [
    viewsRaw, clicksRaw, sharesRaw, refsRaw,
    domViewsRaw, domClicksRaw, domSharesRaw,
    uniqueVisitors, uniqueSharers,
    timingSum, timingCount,
  ] = await Promise.all([
    redis.zrange<string[]>("views:leaderboard", 0, 49, {
      rev: true,
      withScores: true,
    }),
    redis.zrange<string[]>("clicks:leaderboard", 0, 49, {
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
    redis.zrange<string[]>("domains:views", 0, -1, {
      rev: true,
      withScores: true,
    }),
    redis.zrange<string[]>("domains:clicks", 0, -1, {
      rev: true,
      withScores: true,
    }),
    redis.zrange<string[]>("domains:shares", 0, -1, {
      rev: true,
      withScores: true,
    }),
    redis.pfcount("visitors"),
    redis.pfcount("sharers"),
    redis.get<string>("share_timing:sum"),
    redis.get<string>("share_timing:count"),
  ]);

  const views = parse(viewsRaw || []);
  const clicks = parse(clicksRaw || []);
  const shares = parse(sharesRaw || []);
  const refs = parse(refsRaw || []);
  const domViews = parse(domViewsRaw || []);
  const domClicks = parse(domClicksRaw || []);
  const domShares = parse(domSharesRaw || []);

  const totalViews = views.reduce((sum, v) => sum + v.count, 0);
  const totalClicks = clicks.reduce((sum, c) => sum + c.count, 0);
  const totalShares = shares.reduce((sum, s) => sum + s.count, 0);
  const totalRefs = refs.reduce((sum, r) => sum + r.count, 0);

  // Virality metrics
  const visitors = uniqueVisitors ?? 0;
  const sharers = uniqueSharers ?? 0;
  const shareRate = visitors > 0 ? (sharers / visitors) * 100 : 0;
  const viralCoeff = sharers > 0 ? totalClicks / sharers : 0;
  const clicksPerShare = totalShares > 0 ? totalClicks / totalShares : 0;
  const tSum = Number(timingSum) || 0;
  const tCount = Number(timingCount) || 0;
  const avgTTS = tCount > 0 ? Math.round(tSum / tCount) : null;
  const namesPerSession = visitors > 0 ? totalViews / visitors : 0;

  // Merge views + clicks + shares per name
  const viewsMap = new Map(views.map((v) => [v.naam, v.count]));
  const clicksMap = new Map(clicks.map((c) => [c.naam, c.count]));
  const sharesMap = new Map(shares.map((s) => [s.naam, s.count]));
  const allNames = new Set([...viewsMap.keys(), ...clicksMap.keys(), ...sharesMap.keys()]);
  const combined = [...allNames]
    .map((naam) => ({
      naam,
      views: viewsMap.get(naam) || 0,
      clicks: clicksMap.get(naam) || 0,
      shares: sharesMap.get(naam) || 0,
    }))
    .sort((a, b) => b.views - a.views);

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

        {/* Virality metrics */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Virality
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card label="Unique visitors" value={visitors.toLocaleString()} />
            <Card label="Share rate" value={`${shareRate.toFixed(1)}%`} sub="sharers / visitors" />
            <Card
              label="Viral coeff (K)"
              value={viralCoeff.toFixed(2)}
              sub="clicks / sharers"
              highlight={viralCoeff >= 1}
            />
            <Card label="Clicks / share" value={clicksPerShare.toFixed(2)} />
            <Card label="Avg time to share" value={avgTTS !== null ? `${avgTTS}s` : "—"} />
            <Card label="Names / session" value={namesPerSession.toFixed(1)} />
          </div>
        </section>

        {/* Volume totals */}
        <section className="mb-12">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Volume
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Card label="Page opens" value={totalViews.toLocaleString()} />
            <Card label="Link clicks" value={totalClicks.toLocaleString()} />
            <Card label="Shared" value={totalShares.toLocaleString()} />
            <Card label="Unique names" value={combined.length.toString()} />
            <Card label="Sources" value={totalRefs.toLocaleString()} />
          </div>
        </section>

        {/* Per-name breakdown */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Per Name
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Opens</th>
                    <th className="px-4 py-3 text-right font-medium">Clicks</th>
                    <th className="px-4 py-3 text-right font-medium">Shared</th>
                    <th className="px-4 py-3 w-28 sr-only">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {combined.map((row, i) => (
                    <tr key={row.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-600">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <a
                          href={`https://${row.naam}.isnietgrappig.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-400 transition-colors"
                        >
                          {capitalize(row.naam)}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                        {row.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">
                        {row.clicks.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-orange-400">
                        {row.shares.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 w-28">
                        <div className="flex h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(row.views / (combined[0]?.views || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {combined.length === 0 && (
              <p className="px-4 py-8 text-center text-zinc-600">No data yet</p>
            )}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-800 text-xs text-zinc-600">
              <span><strong className="text-zinc-400">Opens</strong> = page loaded</span>
              <span><strong className="text-emerald-400">Clicks</strong> = via shared link</span>
              <span><strong className="text-orange-400">Shared</strong> = share button pressed</span>
            </div>
          </div>
        </section>

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

        {/* Domain breakdown */}
        <section className="mt-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Per Domain
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="px-4 py-3 text-left font-medium">Domain</th>
                    <th className="px-4 py-3 text-right font-medium">Opens</th>
                    <th className="px-4 py-3 text-right font-medium">Clicks</th>
                    <th className="px-4 py-3 text-right font-medium">Shared</th>
                  </tr>
                </thead>
                <tbody>
                  {(["nl", "en"] as const).map((d) => {
                    const dv = domViews.find((x) => x.naam === d)?.count || 0;
                    const dc = domClicks.find((x) => x.naam === d)?.count || 0;
                    const ds = domShares.find((x) => x.naam === d)?.count || 0;
                    if (dv === 0 && dc === 0 && ds === 0) return null;
                    return (
                      <tr key={d} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="px-4 py-2.5 font-medium">
                          {d === "nl" ? "isnietgrappig.com" : "isntfunny.com"}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-zinc-400">
                          {dv.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">
                          {dc.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-orange-400">
                          {ds.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {domViews.length === 0 && (
              <p className="px-4 py-8 text-center text-zinc-600">No domain data yet &mdash; new visits will start tracking</p>
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

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border bg-zinc-900/50 p-5 ${highlight ? "border-emerald-800" : "border-zinc-800"}`}>
      <div className={`text-3xl font-bold tabular-nums ${highlight ? "text-emerald-400" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-zinc-700">{sub}</div>}
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
