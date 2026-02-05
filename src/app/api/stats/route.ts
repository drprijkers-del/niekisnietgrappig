import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key || key !== process.env.STATS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedis();

    // Top 50 views, clicks, shares, and all refs (name, score pairs)
    const [
      viewsRaw, clicksRaw, sharesRaw, refsRaw,
      domainViewsRaw, domainClicksRaw, domainSharesRaw,
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

    // Parse [name, score, name, score, ...] into objects
    const parse = (raw: string[]) => {
      const result: { naam: string; count: number }[] = [];
      for (let i = 0; i < raw.length; i += 2) {
        result.push({ naam: raw[i], count: Number(raw[i + 1]) });
      }
      return result;
    };

    const views = parse(viewsRaw || []);
    const clicks = parse(clicksRaw || []);
    const shares = parse(sharesRaw || []);
    const refs = parse(refsRaw || []);
    const domainViews = parse(domainViewsRaw || []);
    const domainClicks = parse(domainClicksRaw || []);
    const domainShares = parse(domainSharesRaw || []);

    const totalViews = views.reduce((sum, v) => sum + v.count, 0);
    const totalClicks = clicks.reduce((sum, c) => sum + c.count, 0);
    const totalShares = shares.reduce((sum, s) => sum + s.count, 0);
    const totalRefs = refs.reduce((sum, r) => sum + r.count, 0);

    const tSum = Number(timingSum) || 0;
    const tCount = Number(timingCount) || 0;

    return NextResponse.json({
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
