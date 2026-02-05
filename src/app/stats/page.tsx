import { redirect } from "next/navigation";
import { Metadata } from "next";
import CopyDashboardLink from "./CopyDashboardLink";
import {
  getRedis,
  fetchDashboard,
  capitalize,
  refLabel,
  viralCoeffStatus,
  shareRateStatus,
  clicksPerShareStatus,
  ttsStatus,
  statusColor,
  statusDot,
  type TimeRange,
  type DashboardData,
  type HourBucket,
  type Status,
} from "@/lib/stats";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
};

type Props = {
  searchParams: Promise<{ key?: string; range?: string }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const { key, range: rangeParam } = await searchParams;

  if (!key || key !== process.env.STATS_SECRET) {
    redirect("/");
  }

  const range: TimeRange =
    rangeParam === "1h" || rangeParam === "24h" || rangeParam === "7d"
      ? rangeParam
      : "24h";

  const redis = getRedis();
  const d = await fetchDashboard(redis, range);

  // Merge views + clicks + shares per name
  const viewsMap = new Map(d.views.map((v) => [v.naam, v.count]));
  const clicksMap = new Map(d.clicks.map((c) => [c.naam, c.count]));
  const sharesMap = new Map(d.shares.map((s) => [s.naam, s.count]));
  const allNames = new Set([...viewsMap.keys(), ...clicksMap.keys(), ...sharesMap.keys()]);
  const combined = [...allNames]
    .map((naam) => ({
      naam,
      views: viewsMap.get(naam) || 0,
      clicks: clicksMap.get(naam) || 0,
      shares: sharesMap.get(naam) || 0,
      shareRate: (viewsMap.get(naam) || 0) > 0
        ? ((sharesMap.get(naam) || 0) / (viewsMap.get(naam) || 1)) * 100
        : 0,
    }))
    .sort((a, b) => b.views - a.views);

  const rangeLabel = range === "1h" ? "Last hour" : range === "24h" ? "Last 24h" : "Last 7 days";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Is Niet Grappig &mdash; viral monitor
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimeRangeSelector currentRange={range} secretKey={key} />
            <CopyDashboardLink />
            <a
              href="/"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              &larr; Home
            </a>
          </div>
        </div>

        {/* A) Alerts & Tips */}
        {d.alerts.length > 0 && (
          <section className="mb-8">
            <div className="space-y-2">
              {d.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    alert.type === "success"
                      ? "border-emerald-800/50 bg-emerald-950/30 text-emerald-300"
                      : alert.type === "warning"
                        ? "border-amber-800/50 bg-amber-950/30 text-amber-300"
                        : "border-blue-800/50 bg-blue-950/30 text-blue-300"
                  }`}
                >
                  <span className="mr-2">
                    {alert.type === "success" ? "+" : alert.type === "warning" ? "!" : "i"}
                  </span>
                  {alert.message}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* B) Viral Snapshot — hero KPI cards */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Viral Snapshot
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KPICard
              label="Visitors"
              value={d.uniqueVisitorsAllTime.toLocaleString()}
              sub={`${d.rangeVisitors.toLocaleString()} in ${rangeLabel.toLowerCase()}`}
            />
            <KPICard
              label="Share rate"
              value={`${d.shareRate.toFixed(1)}%`}
              sub="sharers / visitors"
              status={shareRateStatus(d.shareRate)}
              target={{ label: "15%", current: d.shareRate, goal: 15 }}
              tips={shareRateStatus(d.shareRate) !== "good" ? [
                "Make share button bigger or more prominent",
                "Add share CTA after the punchline section",
                "Pre-fill a funnier share text",
              ] : undefined}
            />
            <KPICard
              label="Viral coeff (K)"
              value={d.viralCoeff.toFixed(2)}
              sub="clicks / sharers"
              status={viralCoeffStatus(d.viralCoeff)}
              target={{ label: "1.00", current: d.viralCoeff, goal: 1 }}
              tips={viralCoeffStatus(d.viralCoeff) !== "good" ? [
                "Improve OG image / WhatsApp preview",
                "Make the share link text more clickable",
                "Add curiosity: 'See why {name} is not funny'",
              ] : undefined}
            />
            <KPICard
              label="Clicks / share"
              value={d.clicksPerShare.toFixed(2)}
              status={clicksPerShareStatus(d.clicksPerShare)}
              target={{ label: "2.00", current: d.clicksPerShare, goal: 2 }}
              tips={clicksPerShareStatus(d.clicksPerShare) !== "good" ? [
                "Test different share text in WhatsApp",
                "Make the OG image more intriguing",
                "Add the person's name in the link preview title",
              ] : undefined}
            />
            <KPICard
              label="Time to share"
              value={d.avgTimeToShare !== null ? `${d.avgTimeToShare}s` : "—"}
              status={ttsStatus(d.avgTimeToShare)}
              target={d.avgTimeToShare !== null ? { label: "&le;30s", current: d.avgTimeToShare, goal: 30, invert: true } : undefined}
              tips={ttsStatus(d.avgTimeToShare) === "bad" ? [
                "Move share buttons higher on the page",
                "Reduce content before the share CTA",
                "Make the hero section more immediately funny",
              ] : undefined}
            />
            <KPICard
              label="Names / session"
              value={d.namesPerSession.toFixed(1)}
              target={{ label: "2.0", current: d.namesPerSession, goal: 2 }}
              tips={d.namesPerSession < 2 ? [
                "Make 'new victim' button more visible",
                "Show suggested names at the bottom",
                "Add 'Try another name' after sharing",
              ] : undefined}
            />
          </div>
        </section>

        {/* C) Trends — sparkline chart */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Trends &mdash; {rangeLabel}
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {d.hourly.some((h) => h.views > 0 || h.clicks > 0 || h.shares > 0) ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                  <div>
                    <span className="text-2xl font-bold tabular-nums">{d.rangeViews.toLocaleString()}</span>
                    <p className="text-xs text-zinc-500 mt-1">Views</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-emerald-400">{d.rangeClicks.toLocaleString()}</span>
                    <p className="text-xs text-zinc-500 mt-1">Clicks</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-orange-400">{d.rangeShares.toLocaleString()}</span>
                    <p className="text-xs text-zinc-500 mt-1">Shares</p>
                  </div>
                </div>
                <Sparkline data={d.hourly} field="views" color="#ef4444" label="Views" />
                <Sparkline data={d.hourly} field="clicks" color="#34d399" label="Clicks" />
                <Sparkline data={d.hourly} field="shares" color="#fb923c" label="Shares" />
              </div>
            ) : (
              <p className="text-center text-zinc-600 py-8">
                No hourly data yet. New events will appear here after the next page view.
              </p>
            )}
          </div>
        </section>

        {/* D) Volume totals (all time) */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Volume (all time)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <MiniCard label="Page opens" value={d.totalViews.toLocaleString()} />
            <MiniCard label="Link clicks" value={d.totalClicks.toLocaleString()} />
            <MiniCard label="Shared" value={d.totalShares.toLocaleString()} />
            <MiniCard label="Unique names" value={combined.length.toString()} />
            <MiniCard label="Sources" value={d.totalRefs.toLocaleString()} />
          </div>
        </section>

        {/* E) Acquisition — Traffic Sources */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Acquisition
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Source breakdown */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="text-xs font-mono uppercase text-zinc-600 mb-3">Traffic Sources</h3>
              {d.refs.length > 0 ? (
                <div className="space-y-2">
                  {d.refs.map((r) => {
                    const pct = d.totalRefs > 0 ? (r.count / d.totalRefs) * 100 : 0;
                    return (
                      <div key={r.naam} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 w-20 shrink-0">{refLabel(r.naam)}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-zinc-400 w-12 text-right">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-600">No referral data yet</p>
              )}
            </div>

            {/* Domain breakdown */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="text-xs font-mono uppercase text-zinc-600 mb-3">Per Domain</h3>
              <div className="space-y-3">
                {(["nl", "en"] as const).map((dom) => {
                  const dv = d.domViews.find((x) => x.naam === dom)?.count || 0;
                  const dc = d.domClicks.find((x) => x.naam === dom)?.count || 0;
                  const ds = d.domShares.find((x) => x.naam === dom)?.count || 0;
                  if (dv === 0 && dc === 0 && ds === 0) return null;
                  return (
                    <div key={dom} className="flex items-center gap-4">
                      <span className="text-xs font-medium w-36 shrink-0">
                        {dom === "nl" ? "isnietgrappig.com" : "isntfunny.com"}
                      </span>
                      <span className="text-xs tabular-nums text-zinc-400">{dv} opens</span>
                      <span className="text-xs tabular-nums text-emerald-400">{dc} clicks</span>
                      <span className="text-xs tabular-nums text-orange-400">{ds} shares</span>
                    </div>
                  );
                })}
              </div>
              {d.domViews.length === 0 && (
                <p className="text-sm text-zinc-600">No domain data yet</p>
              )}
            </div>
          </div>
        </section>

        {/* F) Leaderboards */}
        <section className="mb-8">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Leaderboard
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
                    <th className="px-4 py-3 text-right font-medium">Share %</th>
                    <th className="px-4 py-3 w-24 sr-only">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {combined.map((row, i) => (
                    <tr key={row.naam} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-600">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <a
                          href={`https://${encodeURIComponent(row.naam)}.isnietgrappig.com`}
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
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-500">
                        {row.shareRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 w-24">
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
              <span><strong className="text-zinc-500">Share %</strong> = shares / opens</span>
            </div>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-700">
          Data refreshes on every page load &middot; Hourly buckets auto-expire after 8 days
        </footer>
      </div>
    </div>
  );
}

// ── Components ─────────────────────────────────────────────────────

function TimeRangeSelector({ currentRange, secretKey }: { currentRange: TimeRange; secretKey: string }) {
  const ranges: TimeRange[] = ["1h", "24h", "7d"];
  return (
    <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
      {ranges.map((r) => (
        <a
          key={r}
          href={`/stats?key=${secretKey}&range=${r}`}
          className={`px-3 py-1.5 text-xs font-mono transition-colors ${
            r === currentRange
              ? "bg-zinc-700 text-white"
              : "text-zinc-500 hover:text-white hover:bg-zinc-800"
          }`}
        >
          {r}
        </a>
      ))}
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  status,
  target,
  tips,
}: {
  label: string;
  value: string;
  sub?: string;
  status?: Status;
  target?: { label: string; current: number; goal: number; invert?: boolean };
  tips?: string[];
}) {
  const border = status ? statusColor(status).split(" ")[1] : "border-zinc-800";
  const textColor = status ? statusColor(status).split(" ")[0] : "";
  const pct = target
    ? Math.min(100, Math.max(0, target.invert
        ? target.current <= target.goal ? 100 : Math.max(0, 100 - ((target.current - target.goal) / target.goal) * 100)
        : (target.current / target.goal) * 100))
    : 0;
  const barColor = status === "good" ? "bg-emerald-400" : status === "ok" ? "bg-amber-400" : "bg-red-400";

  return (
    <div className={`rounded-xl border bg-zinc-900/50 p-4 ${border}`}>
      <div className="flex items-center gap-2">
        {status && <div className={`w-2 h-2 rounded-full ${statusDot(status)}`} />}
        <div className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}</div>
      </div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-zinc-700">{sub}</div>}
      {target && (
        <div className="mt-2">
          <div className="flex h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-zinc-600">
            <span>{Math.round(pct)}%</span>
            <span>target: {target.label}</span>
          </div>
        </div>
      )}
      {tips && tips.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {tips.map((tip, i) => (
            <li key={i} className="text-[10px] text-zinc-600 leading-tight">
              <span className="text-amber-500 mr-1">&rarr;</span>{tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function Sparkline({
  data,
  field,
  color,
  label,
}: {
  data: HourBucket[];
  field: keyof Pick<HourBucket, "views" | "clicks" | "shares">;
  color: string;
  label: string;
}) {
  const values = data.map((h) => h[field]);
  const max = Math.max(...values, 1);
  const w = 600;
  const h = 40;
  const step = w / Math.max(values.length - 1, 1);

  const points = values
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");

  const areaPoints = `0,${h} ${points} ${(values.length - 1) * step},${h}`;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-zinc-600 w-12 shrink-0 uppercase">{label}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="flex-1 h-10" preserveAspectRatio="none">
        <polygon points={areaPoints} fill={color} fillOpacity="0.1" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="text-[10px] text-zinc-600 tabular-nums w-8 text-right">
        {values[values.length - 1] || 0}
      </span>
    </div>
  );
}
