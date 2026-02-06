import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TOP = { naam: "Niek", count: 999 };
const THRESHOLD = 50;
const SORTED_SET_KEY = "shares:leaderboard";
const DOMAIN_SHARES_KEY = "domains:shares";
const CACHE_TTL = 30; // seconds

function getDomain(request: NextRequest): "nl" | "en" {
  const host = request.headers.get("host") || "";
  if (host.includes("isntfunny")) return "en";
  // Default to "nl" for isnietgrappig.com, localhost, lvh.me, etc.
  return "nl";
}

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function hourKey() {
  const d = new Date();
  return `h:${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}${String(d.getUTCHours()).padStart(2, "0")}`;
}

// POST: increment share count — 1 Redis command (ZINCRBY)
export async function POST(request: NextRequest) {
  try {
    const { naam, sid, ttShare } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const redis = getRedis();
    const pipeline = redis.pipeline();
    const hk = hourKey();

    pipeline.zincrby(SORTED_SET_KEY, 1, naam.toLowerCase());
    pipeline.hincrby(hk, "shares", 1);

    if (sid && typeof sid === "string") {
      pipeline.pfadd("sharers", sid);
    }

    if (typeof ttShare === "number" && ttShare > 0 && ttShare < 3600) {
      pipeline.incrbyfloat("share_timing:sum", ttShare);
      pipeline.incrby("share_timing:count", 1);
    }

    const domain = getDomain(request);
    if (domain) {
      pipeline.zincrby(DOMAIN_SHARES_KEY, 1, domain);
    }

    pipeline.expire(hk, 691200);

    const results = await pipeline.exec();
    const count = results[0] as number;

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
