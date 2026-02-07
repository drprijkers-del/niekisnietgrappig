import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { getSiteFromRequest, redisKey } from "@/lib/sites";

const MAX_LEN = 140;

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// POST: store a suggestion — 1 LPUSH
export async function POST(request: NextRequest) {
  try {
    const { naam, text } = await request.json();

    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!text || typeof text !== "string" || text.trim().length === 0 || text.length > MAX_LEN) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const site = getSiteFromRequest(request);
    const redis = getRedis();

    const item = JSON.stringify({
      naam: naam.toLowerCase(),
      text: text.trim(),
      ts: Date.now(),
    });

    const pipeline = redis.pipeline();
    pipeline.lpush(redisKey(site, "suggestions"), item);
    pipeline.llen(redisKey(site, "suggestions"));
    const results = await pipeline.exec();

    const count = results[1] as number;

    return NextResponse.json({ ok: true, count });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET: return suggestion count (public, cached 60s)
export async function GET(request: NextRequest) {
  try {
    const site = getSiteFromRequest(request);
    const redis = getRedis();
    const count = await redis.llen(redisKey(site, "suggestions"));

    return NextResponse.json({ count }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
