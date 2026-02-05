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

    // Top 50 views and shares (name, score pairs)
    const [viewsRaw, sharesRaw] = await Promise.all([
      redis.zrange<string[]>("views:leaderboard", 0, 49, {
        rev: true,
        withScores: true,
      }),
      redis.zrange<string[]>("shares:leaderboard", 0, 49, {
        rev: true,
        withScores: true,
      }),
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
    const shares = parse(sharesRaw || []);

    const totalViews = views.reduce((sum, v) => sum + v.count, 0);
    const totalShares = shares.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      totalViews,
      totalShares,
      uniqueNames: views.length,
      topViewed: views.slice(0, 20),
      topShared: shares.slice(0, 20),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
