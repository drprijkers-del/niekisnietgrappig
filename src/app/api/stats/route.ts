import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { ALL_SITES, redisKey, type SiteConfig } from "@/lib/sites";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// Parse [name, score, name, score, ...] into objects
function parse(raw: string[]) {
  const result: { naam: string; count: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    result.push({ naam: raw[i], count: Number(raw[i + 1]) });
  }
  return result;
}

async function fetchSiteStats(redis: Redis, site: SiteConfig) {
  const [
    viewsRaw, clicksRaw, sharesRaw, refsRaw,
    uniqueVisitors, uniqueSharers,
    timingSum, timingCount,
  ] = await Promise.all([
    redis.zrange<string[]>(redisKey(site, "views:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "clicks:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "shares:leaderboard"), 0, 49, { rev: true, withScores: true }),
    redis.zrange<string[]>(redisKey(site, "refs:leaderboard"), 0, -1, { rev: true, withScores: true }),
    redis.pfcount(redisKey(site, "visitors")),
    redis.pfcount(redisKey(site, "sharers")),
    redis.get<string>(redisKey(site, "share_timing:sum")),
    redis.get<string>(redisKey(site, "share_timing:count")),
  ]);

  const views = parse(viewsRaw || []);
  const clicks = parse(clicksRaw || []);
  const shares = parse(sharesRaw || []);
  const refs = parse(refsRaw || []);

  const totalViews = views.reduce((sum, v) => sum + v.count, 0);
  const totalClicks = clicks.reduce((sum, c) => sum + c.count, 0);
  const totalShares = shares.reduce((sum, s) => sum + s.count, 0);
  const totalRefs = refs.reduce((sum, r) => sum + r.count, 0);

  const tSum = Number(timingSum) || 0;
  const tCount = Number(timingCount) || 0;

  return {
    siteId: site.siteId,
    siteName: site.siteName,
    totalViews,
    totalClicks,
    totalShares,
    totalRefs,
    uniqueNames: views.length,
    uniqueVisitors: uniqueVisitors ?? 0,
    uniqueSharers: uniqueSharers ?? 0,
    avgTimeToShare: tCount > 0 ? Math.round(tSum / tCount) : null,
    topViewed: views.slice(0, 20),
    topClicked: clicks.slice(0, 20),
    topShared: shares.slice(0, 20),
    referrals: refs,
  };
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key || key !== process.env.STATS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedis();

    // Fetch stats for all sites in parallel
    const siteStats = await Promise.all(
      ALL_SITES.map((site) => fetchSiteStats(redis, site))
    );

    // Fetch global domain counters
    const [domainViewsRaw, domainClicksRaw, domainSharesRaw] = await Promise.all([
      redis.zrange<string[]>("domains:views", 0, -1, { rev: true, withScores: true }),
      redis.zrange<string[]>("domains:clicks", 0, -1, { rev: true, withScores: true }),
      redis.zrange<string[]>("domains:shares", 0, -1, { rev: true, withScores: true }),
    ]);

    const domainViews = parse(domainViewsRaw || []);
    const domainClicks = parse(domainClicksRaw || []);
    const domainShares = parse(domainSharesRaw || []);

    // Compute global totals
    const globalTotalViews = siteStats.reduce((sum, s) => sum + s.totalViews, 0);
    const globalTotalClicks = siteStats.reduce((sum, s) => sum + s.totalClicks, 0);
    const globalTotalShares = siteStats.reduce((sum, s) => sum + s.totalShares, 0);

    return NextResponse.json({
      // Global totals
      totalViews: globalTotalViews,
      totalClicks: globalTotalClicks,
      totalShares: globalTotalShares,
      // Per-site stats
      sites: siteStats,
      // Domain counters
      domains: {
        views: Object.fromEntries(domainViews.map((d) => [d.naam, d.count])),
        clicks: Object.fromEntries(domainClicks.map((d) => [d.naam, d.count])),
        shares: Object.fromEntries(domainShares.map((d) => [d.naam, d.count])),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
