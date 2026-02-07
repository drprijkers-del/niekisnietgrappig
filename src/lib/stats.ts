import { Redis } from "@upstash/redis";
import { type SiteConfig, type SiteId, SITES, ALL_SITES, redisKey } from "@/lib/sites";

// ── Redis ──────────────────────────────────────────────────────────
export function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// ── Time helpers ───────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Generate hourly key suffixes for the last N hours from now (UTC). */
export function hourKeys(hours: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = 0; i < hours; i++) {
    const d = new Date(now - i * 3600_000);
    keys.push(
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}`
    );
  }
  return keys;
}

/** Generate daily key suffixes for the last N days from now (UTC). */
export function dayKeys(days: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = 0; i < days; i++) {
    const d = new Date(now - i * 86400_000);
    keys.push(
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
    );
  }
  return keys;
}

export type TimeRange = "1h" | "24h" | "7d";

function hoursForRange(range: TimeRange): number {
  switch (range) {
    case "1h": return 1;
    case "24h": return 24;
    case "7d": return 168;
  }
}

// ── Parse sorted set pairs ─────────────────────────────────────────
export function parsePairs(raw: string[]): { naam: string; count: number }[] {
  const result: { naam: string; count: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    result.push({ naam: raw[i], count: Number(raw[i + 1]) });
  }
  return result;
}

export function capitalize(s: string) {
  return s.replace(/(^|[\s'-])(\S)/g, (_, sep, c) => sep + c.toUpperCase());
}

// ── Hourly timeseries data ─────────────────────────────────────────
export interface HourBucket {
  key: string; // YYYYMMDDHH
  views: number;
  clicks: number;
  shares: number;
}

export async function fetchHourlyData(
  redis: Redis,
  range: TimeRange,
  site: SiteConfig = SITES.grappig
): Promise<HourBucket[]> {
  const hours = hoursForRange(range);
  const keys = hourKeys(hours);
  const pipeline = redis.pipeline();

  for (const k of keys) {
    pipeline.hgetall(redisKey(site, `h:${k}`));
  }

  const results = await pipeline.exec();
  return keys.map((k, i) => {
    const data = (results[i] as Record<string, string>) || {};
    return {
      key: k,
      views: Number(data.views) || 0,
      clicks: Number(data.clicks) || 0,
      shares: Number(data.shares) || 0,
    };
  }).reverse(); // oldest first for charts
}

/** Sum unique visitors from hourly HyperLogLogs using PFCOUNT with multiple keys. */
export async function fetchUniqueVisitors(
  redis: Redis,
  range: TimeRange,
  site: SiteConfig = SITES.grappig
): Promise<number> {
  const hours = hoursForRange(range);
  const keys = hourKeys(hours).map((k) => redisKey(site, `hv:${k}`));
  if (keys.length === 0) return 0;
  // PFCOUNT with multiple keys gives the union cardinality
  return (await redis.pfcount(...(keys as [string, ...string[]]))) ?? 0;
}

// ── Full dashboard data ────────────────────────────────────────────
export interface DashboardData {
  // Cumulative totals (all time)
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  totalRefs: number;
  uniqueVisitorsAllTime: number;
  uniqueSharersAllTime: number;
  avgTimeToShare: number | null;
  groupChecks: number;

  // Time-range data
  range: TimeRange;
  hourly: HourBucket[];
  rangeViews: number;
  rangeClicks: number;
  rangeShares: number;
  rangeVisitors: number;

  // Leaderboards (all time, top 50)
  views: { naam: string; count: number }[];
  clicks: { naam: string; count: number }[];
  shares: { naam: string; count: number }[];
  refs: { naam: string; count: number }[];

  // Derived metrics
  shareRate: number;
  viralCoeff: number;
  clicksPerShare: number;
  namesPerSession: number;

  // Suggestions
  suggestionsCount: number;
  recentSuggestions: { naam: string; text: string; ts: number }[];

  // Alerts
  alerts: Alert[];
}

export async function fetchDashboard(
  redis: Redis,
  range: TimeRange,
  site: SiteConfig = SITES.grappig
): Promise<DashboardData> {
  // Fetch everything in parallel
  const [
    viewsRaw, clicksRaw, sharesRaw, refsRaw,
    uniqueVisitorsAll, uniqueSharersAll,
    timingSum, timingCount,
    groupChecksRaw,
    hourly, rangeVisitors,
    suggestionsCountRaw, suggestionsRaw,
  ] = await Promise.all([
    redis.zrange<string[]>(redisKey(site, "views:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "clicks:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "shares:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "refs:leaderboard"), 0, -1, { rev: true, withScores: true }),
    redis.pfcount(redisKey(site, "visitors")),
    redis.pfcount(redisKey(site, "sharers")),
    redis.get<string>(redisKey(site, "share_timing:sum")),
    redis.get<string>(redisKey(site, "share_timing:count")),
    redis.get<string>(redisKey(site, "group_checks:total")),
    fetchHourlyData(redis, range, site),
    fetchUniqueVisitors(redis, range, site),
    redis.llen(redisKey(site, "suggestions")),
    redis.lrange<string>(redisKey(site, "suggestions"), 0, 19),
  ]);

  const views = parsePairs(viewsRaw || []);
  const clicks = parsePairs(clicksRaw || []);
  const shares = parsePairs(sharesRaw || []);
  const refs = parsePairs(refsRaw || []);

  const totalViews = views.reduce((s, v) => s + v.count, 0);
  const totalClicks = clicks.reduce((s, c) => s + c.count, 0);
  const totalShares = shares.reduce((s, v) => s + v.count, 0);
  const totalRefs = refs.reduce((s, r) => s + r.count, 0);

  const visitors = uniqueVisitorsAll ?? 0;
  const sharers = uniqueSharersAll ?? 0;
  const tSum = Number(timingSum) || 0;
  const tCount = Number(timingCount) || 0;
  const groupChecks = Number(groupChecksRaw) || 0;

  const suggestionsCount = (suggestionsCountRaw as number) ?? 0;
  const recentSuggestions = ((suggestionsRaw as unknown[]) || []).map((raw) => {
    try {
      const item = typeof raw === "string" ? JSON.parse(raw) : raw;
      return item as { naam: string; text: string; ts: number };
    } catch { return null; }
  }).filter((s): s is { naam: string; text: string; ts: number } => s !== null);

  const rangeViews = hourly.reduce((s, h) => s + h.views, 0);
  const rangeClicks = hourly.reduce((s, h) => s + h.clicks, 0);
  const rangeShares = hourly.reduce((s, h) => s + h.shares, 0);

  const shareRate = visitors > 0 ? (sharers / visitors) * 100 : 0;
  const viralCoeff = sharers > 0 ? totalClicks / sharers : 0;
  const clicksPerShare = totalShares > 0 ? totalClicks / totalShares : 0;
  const namesPerSession = visitors > 0 ? totalViews / visitors : 0;

  const data: DashboardData = {
    totalViews,
    totalClicks,
    totalShares,
    totalRefs,
    uniqueVisitorsAllTime: visitors,
    uniqueSharersAllTime: sharers,
    avgTimeToShare: tCount > 0 ? Math.round(tSum / tCount) : null,
    groupChecks,
    range,
    hourly,
    rangeViews,
    rangeClicks,
    rangeShares,
    rangeVisitors,
    views,
    clicks,
    shares,
    refs,
    shareRate,
    viralCoeff,
    clicksPerShare,
    namesPerSession,
    suggestionsCount,
    recentSuggestions,
    alerts: [],
  };

  data.alerts = generateAlerts(data);
  return data;
}

// ── Overview (all sites) ──────────────────────────────────────────
export interface SiteSummary {
  siteId: SiteId;
  siteName: string;
  accentColor: string;
  domain: string;
  domainEn: string | null;
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  uniqueVisitors: number;
  uniqueSharers: number;
  shareRate: number;
  viralCoeff: number;
  uniqueNames: number;
  topName: string | null;
  topNameViews: number;
}

export interface OverviewData {
  sites: SiteSummary[];
  grandTotalViews: number;
  grandTotalClicks: number;
  grandTotalShares: number;
  grandTotalVisitors: number;
  grandTotalSharers: number;
  allSuggestions: { siteId: SiteId; naam: string; text: string; ts: number }[];
  totalSuggestions: number;
}

export async function fetchOverview(redis: Redis): Promise<OverviewData> {
  const pipeline = redis.pipeline();

  // 7 commands per site: views, clicks, shares, visitors HLL, sharers HLL, suggestions count, suggestions list
  for (const site of ALL_SITES) {
    pipeline.zrange(redisKey(site, "views:leaderboard"), 0, -1, { rev: true, withScores: true });
    pipeline.zrange(redisKey(site, "clicks:leaderboard"), 0, -1, { rev: true, withScores: true });
    pipeline.zrange(redisKey(site, "shares:leaderboard"), 0, -1, { rev: true, withScores: true });
    pipeline.pfcount(redisKey(site, "visitors"));
    pipeline.pfcount(redisKey(site, "sharers"));
    pipeline.llen(redisKey(site, "suggestions"));
    pipeline.lrange(redisKey(site, "suggestions"), 0, 19);
  }

  const results = await pipeline.exec();

  let totalSuggestions = 0;
  let allSuggestions: { siteId: SiteId; naam: string; text: string; ts: number }[] = [];

  const sites: SiteSummary[] = ALL_SITES.map((site, i) => {
    const base = i * 7;
    const viewsPairs = parsePairs((results[base] as string[]) || []);
    const clicksPairs = parsePairs((results[base + 1] as string[]) || []);
    const sharesPairs = parsePairs((results[base + 2] as string[]) || []);
    const visitors = (results[base + 3] as number) ?? 0;
    const sharers = (results[base + 4] as number) ?? 0;
    const sugCount = (results[base + 5] as number) ?? 0;
    const sugRaw = (results[base + 6] as unknown[]) || [];

    totalSuggestions += sugCount;
    for (const raw of sugRaw) {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const item = parsed as { naam: string; text: string; ts: number };
        allSuggestions.push({ siteId: site.siteId, ...item });
      } catch { /* skip */ }
    }

    const totalViews = viewsPairs.reduce((s, v) => s + v.count, 0);
    const totalClicks = clicksPairs.reduce((s, c) => s + c.count, 0);
    const totalShares = sharesPairs.reduce((s, v) => s + v.count, 0);

    return {
      siteId: site.siteId,
      siteName: site.siteName,
      accentColor: site.accentColor,
      domain: site.domain,
      domainEn: site.domainEn,
      totalViews,
      totalClicks,
      totalShares,
      uniqueVisitors: visitors,
      uniqueSharers: sharers,
      shareRate: visitors > 0 ? (sharers / visitors) * 100 : 0,
      viralCoeff: sharers > 0 ? totalClicks / sharers : 0,
      uniqueNames: viewsPairs.length,
      topName: viewsPairs[0]?.naam ?? null,
      topNameViews: viewsPairs[0]?.count ?? 0,
    };
  });

  // Sort all suggestions by timestamp (newest first), take 30
  allSuggestions.sort((a, b) => b.ts - a.ts);
  allSuggestions = allSuggestions.slice(0, 30);

  return {
    sites,
    grandTotalViews: sites.reduce((s, x) => s + x.totalViews, 0),
    grandTotalClicks: sites.reduce((s, x) => s + x.totalClicks, 0),
    grandTotalShares: sites.reduce((s, x) => s + x.totalShares, 0),
    grandTotalVisitors: sites.reduce((s, x) => s + x.uniqueVisitors, 0),
    grandTotalSharers: sites.reduce((s, x) => s + x.uniqueSharers, 0),
    allSuggestions,
    totalSuggestions,
  };
}

// ── Status bands ───────────────────────────────────────────────────
export type Status = "good" | "ok" | "bad";

export function viralCoeffStatus(k: number): Status {
  if (k >= 1) return "good";
  if (k >= 0.5) return "ok";
  return "bad";
}

export function shareRateStatus(rate: number): Status {
  if (rate >= 15) return "good";
  if (rate >= 5) return "ok";
  return "bad";
}

export function clicksPerShareStatus(cps: number): Status {
  if (cps >= 2) return "good";
  if (cps >= 1) return "ok";
  return "bad";
}

export function ttsStatus(seconds: number | null): Status {
  if (seconds === null) return "ok";
  if (seconds <= 30) return "good";
  if (seconds <= 120) return "ok";
  return "bad";
}

export function statusColor(s: Status): string {
  switch (s) {
    case "good": return "text-emerald-400 border-emerald-800";
    case "ok": return "text-amber-400 border-amber-800";
    case "bad": return "text-red-400 border-red-800";
  }
}

export function statusDot(s: Status): string {
  switch (s) {
    case "good": return "bg-emerald-400";
    case "ok": return "bg-amber-400";
    case "bad": return "bg-red-400";
  }
}

// ── Alerts & Tips engine ───────────────────────────────────────────
export interface Alert {
  type: "success" | "warning" | "info";
  message: string;
}

interface AlertRule {
  check: (d: DashboardData) => boolean;
  type: "success" | "warning" | "info";
  message: (d: DashboardData) => string;
}

const ALERT_RULES: AlertRule[] = [
  {
    check: (d) => d.viralCoeff >= 1,
    type: "success",
    message: () => "Viral coefficient >= 1: growth loop is active! Each sharer brings more than 1 new visitor.",
  },
  {
    check: (d) => d.viralCoeff > 0 && d.viralCoeff < 0.5,
    type: "warning",
    message: (d) => `Viral coefficient is ${d.viralCoeff.toFixed(2)}: shared links aren't converting enough. Improve share preview / OG image.`,
  },
  {
    check: (d) => d.shareRate < 5 && d.uniqueVisitorsAllTime > 50,
    type: "warning",
    message: (d) => `Share rate is only ${d.shareRate.toFixed(1)}%. Test CTA copy or make the share button more prominent.`,
  },
  {
    check: (d) => d.shareRate >= 20,
    type: "success",
    message: (d) => `Share rate is ${d.shareRate.toFixed(1)}% — excellent! People love sharing this.`,
  },
  {
    check: (d) => {
      const waRef = d.refs.find((r) => r.naam === "wa");
      return (waRef?.count ?? 0) > 0 && d.clicksPerShare < 1;
    },
    type: "warning",
    message: () => "WhatsApp shares are high but clicks per share is low. Improve the share text or link preview.",
  },
  {
    check: (d) => {
      if (d.views.length < 2) return false;
      const top = d.views[0];
      const second = d.views[1];
      return top.count > second.count * 3 && top.count > 20;
    },
    type: "info",
    message: (d) => `"${capitalize(d.views[0].naam)}" is spiking with ${d.views[0].count} views — ride the wave and share it!`,
  },
  {
    check: (d) => d.avgTimeToShare !== null && d.avgTimeToShare <= 15,
    type: "success",
    message: (d) => `Average time to share is ${d.avgTimeToShare}s — users convert fast. The UX works.`,
  },
  {
    check: (d) => d.avgTimeToShare !== null && d.avgTimeToShare > 120,
    type: "warning",
    message: (d) => `Average time to share is ${d.avgTimeToShare}s — users hesitate. Simplify the page or move share CTA higher.`,
  },
  {
    check: (d) => d.rangeViews === 0 && d.totalViews > 0,
    type: "info",
    message: () => "No traffic in this time window. Time to share some links!",
  },
  {
    check: (d) => d.namesPerSession >= 2,
    type: "success",
    message: (d) => `Users try ${d.namesPerSession.toFixed(1)} names per session — the loop is working.`,
  },
  {
    check: (d) => {
      const copyRef = d.refs.find((r) => r.naam === "copy");
      const waRef = d.refs.find((r) => r.naam === "wa");
      return (copyRef?.count ?? 0) > (waRef?.count ?? 0) * 2;
    },
    type: "info",
    message: () => "Copy link is used more than WhatsApp. Users might be sharing on platforms we don't track (Telegram, iMessage, etc.).",
  },
];

function generateAlerts(data: DashboardData): Alert[] {
  return ALERT_RULES
    .filter((rule) => rule.check(data))
    .map((rule) => ({ type: rule.type, message: rule.message(data) }));
}

// ── Ref labels ─────────────────────────────────────────────────────
export function refLabel(ref: string): string {
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
