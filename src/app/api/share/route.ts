import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TOP = { naam: "Niek", count: 999 };
const THRESHOLD = 50;
const SORTED_SET_KEY = "shares:leaderboard";
const CACHE_TTL = 30; // seconds

function getRedis() {
  return Redis.fromEnv();
}

// POST: increment share count — 1 Redis command (ZINCRBY)
export async function POST(request: NextRequest) {
  try {
    const { naam } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const redis = getRedis();
    const count = await redis.zincrby(SORTED_SET_KEY, 1, naam.toLowerCase());

    return NextResponse.json({ naam, count });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

// GET: fetch #1 most shared — 1 Redis command (ZRANGE REV LIMIT)
// Cached for 30s via Cache-Control + stale-while-revalidate
export async function GET() {
  try {
    const redis = getRedis();

    // Get top 1 from sorted set with scores, descending
    const result = await redis.zrange<string[]>(SORTED_SET_KEY, 0, 0, {
      rev: true,
      withScores: true,
    });

    // result = [name, score] or []
    if (!result || result.length < 2) {
      return cachedResponse({ top: DEFAULT_TOP });
    }

    const topNaam = result[0];
    const topCount = Number(result[1]);

    if (topCount < THRESHOLD) {
      return cachedResponse({ top: DEFAULT_TOP });
    }

    const naam = topNaam
      .replace(/(^|[\s-])(\w)/g, (_, sep, char) => sep + char.toUpperCase());

    return cachedResponse({ top: { naam, count: topCount } });
  } catch {
    return cachedResponse({ top: DEFAULT_TOP });
  }
}

function cachedResponse(data: object) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=60`,
    },
  });
}
