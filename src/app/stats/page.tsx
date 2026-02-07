import { redirect } from "next/navigation";
import { Metadata } from "next";
import CopyDashboardLink from "./CopyDashboardLink";
import LeaderboardToggle from "./LeaderboardToggle";
import DownloadLeaderboard from "./DownloadLeaderboard";
import {
  getRedis,
  fetchDashboard,
  fetchOverview,
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
  type OverviewData,
  type SiteSummary,
} from "@/lib/stats";
import { SITES, ALL_SITES, type SiteId, type SiteConfig } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
};

type Props = {
  searchParams: Promise<{ key?: string; range?: string; site?: string }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const { key, range: rangeParam, site: siteParam } = await searchParams;

  if (!key || key !== process.env.STATS_SECRET) {
    redirect("/");
  }

  const range: TimeRange =
    rangeParam === "1h" || rangeParam === "24h" || rangeParam === "7d"
      ? rangeParam
      : "24h";

  const isOverview = siteParam === "all";
  const activeSiteId: SiteId | "all" = isOverview ? "all" : (siteParam && siteParam in SITES) ? siteParam as SiteId : "grappig";
  const activeSite: SiteConfig | null = isOverview ? null : SITES[activeSiteId as SiteId];

  const redis = getRedis();

  // Fetch overview or per-site data
  const overview: OverviewData | null = isOverview ? await fetchOverview(redis) : null;
  const d: DashboardData | null = !isOverview && activeSite ? await fetchDashboard(redis, range, activeSite) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {isOverview ? "All sites" : activeSite!.siteName} &mdash; viral monitor
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`/stats?key=${key}&range=${range}&site=${activeSiteId}`}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 px-2.5 py-1.5 text-zinc-400 transition-all hover:bg-white hover:text-black hover:border-white"
              title="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </a>
            {!isOverview && <TimeRangeSelector currentRange={range} secretKey={key} activeSiteId={activeSiteId as SiteId} />}
            <CopyDashboardLink />
            <a
              href="/"
              className="text-xs sm:text-sm text-zinc-500 hover:text-white transition-colors"
            >
              &larr;
            </a>
          </div>
        </div>

        {/* Site selector tabs */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          <a
            href={`/stats?key=${key}&range=${range}&site=all`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isOverview
                ? "bg-white text-black"
                : "text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-800"
            }`}
          >
            Overview
          </a>
          {ALL_SITES.map((s) => (
            <a
              key={s.siteId}
              href={`/stats?key=${key}&range=${range}&site=${s.siteId}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !s.enabled
                  ? "text-zinc-700 border border-zinc-800/50 opacity-50"
                  : s.siteId === activeSiteId
                    ? "text-white"
                    : "text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-800"
              }`}
              style={s.siteId === activeSiteId && s.enabled ? { backgroundColor: s.accentColor } : {}}
            >
              {s.siteName}{!s.enabled && <span className="ml-1 text-[9px] text-zinc-600">(parked)</span>}
            </a>
          ))}
        </div>

        {isOverview && overview ? (
          <OverviewView data={overview} secretKey={key} range={range} />
        ) : d && activeSite ? (
          <PerSiteView d={d} activeSite={activeSite} range={range} secretKey={key} />
        ) : null}

        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-700">
          Data refreshes on every page load &middot; Hourly buckets auto-expire after 8 days
        </footer>
      </div>
    </div>
  );
}

// ── Overview View ──────────────────────────────────────────────────

function OverviewView({ data, secretKey, range }: { data: OverviewData; secretKey: string; range: string }) {
  const maxViews = Math.max(...data.sites.map((s) => s.totalViews), 1);

  return (
    <>
      {/* Grand totals */}
      <section className="mb-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          All Sites &mdash; Totals
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniCard label="Total views" value={data.grandTotalViews.toLocaleString()} />
          <MiniCard label="Total clicks" value={data.grandTotalClicks.toLocaleString()} />
          <MiniCard label="Total shares" value={data.grandTotalShares.toLocaleString()} />
          <MiniCard label="Unique visitors" value={data.grandTotalVisitors.toLocaleString()} />
          <MiniCard label="Unique sharers" value={data.grandTotalSharers.toLocaleString()} />
        </div>
      </section>

      {/* Per-site comparison table */}
      <section className="mb-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          Per Site
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-medium">Site</th>
                  <th className="px-2 py-2 sm:py-3 text-center font-medium w-10">Health</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-medium">Views</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-medium">Clicks</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-medium">Shares</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right font-medium">Visitors</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right font-medium">Share %</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right font-medium">K</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left font-medium">Top name</th>
                  <th className="hidden sm:table-cell px-4 py-3 w-28 sr-only">Bar</th>
                </tr>
              </thead>
              <tbody>
                {data.sites.map((s) => {
                  const siteConf = SITES[s.siteId as SiteId];
                  const isParked = siteConf && !siteConf.enabled;
                  return (
                  <tr key={s.siteId} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${isParked ? "opacity-40" : ""}`}>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium">
                      <a
                        href={`/stats?key=${secretKey}&range=${range}&site=${s.siteId}`}
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isParked ? "#3f3f46" : s.accentColor }} />
                        <span>
                          <span className="truncate">{s.domain}</span>
                          {isParked && <span className="ml-1 text-[9px] text-zinc-600">(parked)</span>}
                          {s.domainEn && (
                            <span className="block text-[10px] text-zinc-600 font-normal">{s.domainEn}</span>
                          )}
                        </span>
                      </a>
                    </td>
                    <td className="px-2 py-2 sm:py-2.5 text-center">
                      <SiteHealth views={s.totalViews} shareRate={s.shareRate} viralK={s.viralCoeff} parked={!!isParked} />
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-400">{s.totalViews.toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-emerald-400">{s.totalClicks.toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-orange-400">{s.totalShares.toLocaleString()}</td>
                    <td className="hidden sm:table-cell px-4 py-2.5 text-right tabular-nums text-zinc-400">{s.uniqueVisitors.toLocaleString()}</td>
                    <td className={`hidden sm:table-cell px-4 py-2.5 text-right tabular-nums ${statusColor(shareRateStatus(s.shareRate)).split(" ")[0]}`}>
                      {s.shareRate.toFixed(1)}%
                    </td>
                    <td className={`hidden sm:table-cell px-4 py-2.5 text-right tabular-nums ${statusColor(viralCoeffStatus(s.viralCoeff)).split(" ")[0]}`}>
                      {s.viralCoeff.toFixed(2)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2.5 text-zinc-500 truncate max-w-32">
                      {s.topName ? (
                        <span>{capitalize(s.topName)} <span className="text-zinc-600">({s.topNameViews})</span></span>
                      ) : (
                        <span className="text-zinc-700">&mdash;</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-2.5 w-28">
                      <div className="flex h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(s.totalViews / maxViews) * 100}%`, backgroundColor: s.accentColor }}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 sm:px-4 py-2 border-t border-zinc-800 text-[10px] sm:text-xs text-zinc-600">
            Click a site name to view full dashboard
          </div>
        </div>
      </section>

      {/* Per-site cards (mobile-friendly) */}
      <section className="mb-8 sm:hidden">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          Details
        </h2>
        <div className="space-y-3">
          {data.sites.map((s) => {
            const sc = SITES[s.siteId as SiteId];
            const parked = sc && !sc.enabled;
            return (
            <a
              key={s.siteId}
              href={`/stats?key=${secretKey}&range=${range}&site=${s.siteId}`}
              className={`block rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors ${parked ? "opacity-40" : ""}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: parked ? "#3f3f46" : s.accentColor }} />
                <div>
                  <span className="font-medium text-sm">{s.domain}</span>
                  {parked && <span className="ml-1 text-[9px] text-zinc-600">(parked)</span>}
                  {s.domainEn && (
                    <span className="block text-[10px] text-zinc-600">{s.domainEn}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold tabular-nums">{s.totalViews.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">views</div>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums text-emerald-400">{s.totalClicks.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">clicks</div>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums text-orange-400">{s.totalShares.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">shares</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500">
                <SiteHealth views={s.totalViews} shareRate={s.shareRate} viralK={s.viralCoeff} parked={!!parked} />
                <span>Share rate: <span className={statusColor(shareRateStatus(s.shareRate)).split(" ")[0]}>{s.shareRate.toFixed(1)}%</span></span>
                <span>K: <span className={statusColor(viralCoeffStatus(s.viralCoeff)).split(" ")[0]}>{s.viralCoeff.toFixed(2)}</span></span>
                <span>{s.uniqueNames} names</span>
              </div>
            </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── Per-Site View ─────────────────────────────────────────────────

function PerSiteView({ d, activeSite, range, secretKey }: { d: DashboardData; activeSite: SiteConfig; range: TimeRange; secretKey: string }) {
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

  // Calculate trends by comparing last 2 hours to previous 2 hours
  const recentHours = d.hourly.slice(-2);
  const previousHours = d.hourly.slice(-4, -2);

  const sumRecent = (field: "views" | "clicks" | "shares") =>
    recentHours.reduce((sum, h) => sum + h[field], 0);
  const sumPrevious = (field: "views" | "clicks" | "shares") =>
    previousHours.reduce((sum, h) => sum + h[field], 0);

  const getTrend = (recent: number, previous: number): "up" | "down" | "flat" => {
    if (previous === 0) return recent > 0 ? "up" : "flat";
    const change = (recent - previous) / previous;
    if (change > 0.1) return "up";
    if (change < -0.1) return "down";
    return "flat";
  };

  const viewsTrend = getTrend(sumRecent("views"), sumPrevious("views"));
  const clicksTrend = getTrend(sumRecent("clicks"), sumPrevious("clicks"));
  const sharesTrend = getTrend(sumRecent("shares"), sumPrevious("shares"));

  const recentShareRate = sumRecent("views") > 0
    ? (sumRecent("shares") / sumRecent("views")) * 100 : 0;
  const prevShareRate = sumPrevious("views") > 0
    ? (sumPrevious("shares") / sumPrevious("views")) * 100 : 0;
  const shareRateTrend = getTrend(recentShareRate, prevShareRate);

  const recentViralK = sumRecent("shares") > 0
    ? sumRecent("clicks") / sumRecent("shares") : 0;
  const prevViralK = sumPrevious("shares") > 0
    ? sumPrevious("clicks") / sumPrevious("shares") : 0;
  const viralKTrend = getTrend(recentViralK, prevViralK);

  return (
    <>
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
            trend={viewsTrend}
          />
          <KPICard
            label="Share rate"
            value={`${d.shareRate.toFixed(1)}%`}
            sub="sharers / visitors"
            status={shareRateStatus(d.shareRate)}
            target={{ label: "15%", current: d.shareRate, goal: 15 }}
            trend={shareRateTrend}
          />
          <KPICard
            label="Viral coeff (K)"
            value={d.viralCoeff.toFixed(2)}
            sub="clicks / sharers"
            status={viralCoeffStatus(d.viralCoeff)}
            target={{ label: "1.00", current: d.viralCoeff, goal: 1 }}
            trend={viralKTrend}
          />
          <KPICard
            label="Clicks / share"
            value={d.clicksPerShare.toFixed(2)}
            status={clicksPerShareStatus(d.clicksPerShare)}
            target={{ label: "2.00", current: d.clicksPerShare, goal: 2 }}
            trend={clicksTrend}
          />
          <KPICard
            label="Time to share"
            value={d.avgTimeToShare !== null ? `${d.avgTimeToShare}s` : "—"}
            status={ttsStatus(d.avgTimeToShare)}
            target={d.avgTimeToShare !== null ? { label: "&le;30s", current: d.avgTimeToShare, goal: 30, invert: true } : undefined}
          />
          <KPICard
            label="Names / session"
            value={d.namesPerSession.toFixed(1)}
            target={{ label: "2.0", current: d.namesPerSession, goal: 2 }}
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
              <Sparkline data={d.hourly} field="views" color={activeSite.accentColor} label="Views" />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <MiniCard label="Page opens" value={d.totalViews.toLocaleString()} />
          <MiniCard label="Link clicks" value={d.totalClicks.toLocaleString()} />
          <MiniCard label="Shared" value={d.totalShares.toLocaleString()} />
          <MiniCard label="Unique names" value={combined.length.toString()} />
          <MiniCard label="Sources" value={d.totalRefs.toLocaleString()} />
          <MiniCard label="Battle checks" value={d.groupChecks.toLocaleString()} highlight={d.groupChecks > 0} />
        </div>
      </section>

      {/* E) Acquisition — Traffic Sources */}
      <section className="mb-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
          Acquisition
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: activeSite.accentColor }} />
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

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-xs font-mono uppercase text-zinc-600 mb-3">Per Domain</h3>
            <div className="space-y-3">
              {d.domViews.map((dom) => {
                const dc = d.domClicks.find((x) => x.naam === dom.naam)?.count || 0;
                const ds = d.domShares.find((x) => x.naam === dom.naam)?.count || 0;
                return (
                  <div key={dom.naam} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-xs font-medium w-full sm:w-36 sm:shrink-0">
                      {dom.naam}
                    </span>
                    <span className="text-xs tabular-nums text-zinc-400">{dom.count} opens</span>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500">
            Leaderboard
          </h2>
          <DownloadLeaderboard secretKey={secretKey} />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium w-8">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Name</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium">Opens</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right font-medium">Clicks</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium">Shared</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-right font-medium">Share %</th>
                  <th className="hidden sm:table-cell px-4 py-3 w-24 sr-only">Bar</th>
                </tr>
              </thead>
              <tbody>
                {combined.slice(0, 10).map((row, i) => (
                  <LeaderboardRow key={row.naam} row={row} rank={i + 1} topViews={combined[0]?.views || 1} domain={activeSite.domain} accentColor={activeSite.accentColor} />
                ))}
              </tbody>
              {combined.length > 10 && (
                <tbody id="leaderboard-extra" className="hidden">
                  {combined.slice(10).map((row, i) => (
                    <LeaderboardRow key={row.naam} row={row} rank={i + 11} topViews={combined[0]?.views || 1} domain={activeSite.domain} accentColor={activeSite.accentColor} />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          {combined.length === 0 && (
            <p className="px-4 py-8 text-center text-zinc-600">No data yet</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 sm:px-4 py-2 border-t border-zinc-800 text-[10px] sm:text-xs text-zinc-600">
            <span><strong className="text-zinc-400">Opens</strong> = page loaded</span>
            <span><strong className="text-emerald-400">Clicks</strong> = via shared link</span>
            <span><strong className="text-orange-400">Shared</strong> = share button pressed</span>
            <span className="hidden sm:inline"><strong className="text-zinc-500">Share %</strong> = shares / opens</span>
            {combined.length > 10 && (
              <span className="ml-auto">
                <LeaderboardToggle total={combined.length} />
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Components ─────────────────────────────────────────────────────

function TimeRangeSelector({ currentRange, secretKey, activeSiteId }: { currentRange: TimeRange; secretKey: string; activeSiteId: SiteId }) {
  const ranges: TimeRange[] = ["1h", "24h", "7d"];
  return (
    <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
      {ranges.map((r) => (
        <a
          key={r}
          href={`/stats?key=${secretKey}&range=${r}&site=${activeSiteId}`}
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
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  status?: Status;
  target?: { label: string; current: number; goal: number; invert?: boolean };
  trend?: "up" | "down" | "flat";
}) {
  const border = status ? statusColor(status).split(" ")[1] : "border-zinc-800";
  const textColor = status ? statusColor(status).split(" ")[0] : "";
  const pct = target
    ? Math.min(100, Math.max(0, target.invert
        ? target.current <= target.goal ? 100 : Math.max(0, 100 - ((target.current - target.goal) / target.goal) * 100)
        : (target.current / target.goal) * 100))
    : 0;
  const barColor = status === "good" ? "bg-emerald-400" : status === "ok" ? "bg-amber-400" : "bg-red-400";

  const TrendIcon = () => {
    if (!trend) return null;
    if (trend === "up") return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    );
    if (trend === "down") return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  };

  return (
    <div className={`rounded-xl border bg-zinc-900/50 p-4 ${border}`}>
      <div className="flex items-center gap-2">
        {status && <div className={`w-2 h-2 rounded-full ${statusDot(status)}`} />}
        <div className={`text-2xl font-bold tabular-nums ${textColor}`}>{value}</div>
        <TrendIcon />
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
    </div>
  );
}

function SiteHealth({ views, shareRate, viralK, parked }: { views: number; shareRate: number; viralK: number; parked: boolean }) {
  if (parked) return <span className="text-[10px] text-zinc-700">--</span>;
  if (views < 10) return <span className="text-[10px] text-zinc-600" title="Not enough data">new</span>;

  // Score: 0-2 points from share rate, 0-2 from viral K
  let score = 0;
  if (shareRate >= 15) score += 2;
  else if (shareRate >= 5) score += 1;
  if (viralK >= 1) score += 2;
  else if (viralK >= 0.5) score += 1;

  const dot = score >= 3 ? "bg-emerald-400" : score >= 1 ? "bg-amber-400" : "bg-red-400";
  const label = score >= 3 ? "good" : score >= 1 ? "ok" : "low";

  return (
    <div className="flex items-center justify-center gap-1" title={`Share: ${shareRate.toFixed(1)}%, K: ${viralK.toFixed(2)}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`text-[10px] ${score >= 3 ? "text-emerald-400" : score >= 1 ? "text-amber-400" : "text-red-400"}`}>{label}</span>
    </div>
  );
}

function MiniCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border bg-zinc-900/50 p-4 ${highlight ? "border-amber-800/50" : "border-zinc-800"}`}>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-amber-400" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function LeaderboardRow({
  row,
  rank,
  topViews,
  domain,
  accentColor,
}: {
  row: { naam: string; views: number; clicks: number; shares: number; shareRate: number };
  rank: number;
  topViews: number;
  domain: string;
  accentColor?: string;
}) {
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
      <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-zinc-600">{rank}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-2.5 font-medium truncate max-w-30 sm:max-w-none">
        <a
          href={`https://${encodeURIComponent(row.naam)}.${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          {capitalize(row.naam)}
        </a>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-400">
        {row.views.toLocaleString()}
      </td>
      <td className="hidden sm:table-cell px-4 py-2.5 text-right tabular-nums text-emerald-400">
        {row.clicks.toLocaleString()}
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-orange-400">
        {row.shares.toLocaleString()}
      </td>
      <td className="hidden sm:table-cell px-4 py-2.5 text-right tabular-nums text-zinc-500">
        {row.shareRate.toFixed(1)}%
      </td>
      <td className="hidden sm:table-cell px-4 py-2.5 w-24">
        <div className="flex h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${(row.views / topViews) * 100}%`, backgroundColor: accentColor || "#ef4444" }}
          />
        </div>
      </td>
    </tr>
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
