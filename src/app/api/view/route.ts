import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { getSiteFromRequest, redisKey } from "@/lib/sites";

// Daily leaderboard keys (expire after 32 days)
const DAILY_VIEWS_TTL = 2764800; // 32 days
const DAILY_CLICKS_TTL = 2764800;

const ALLOWED_REFS = new Set(["wa", "copy", "x", "ig", "tiktok", "fb", "email"]);

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

function dayKey() {
  const d = new Date();
  return `dv:${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

function dailyViewsKey() {
  const d = new Date();
  return `views:daily:${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

function dailyClicksKey() {
  const d = new Date();
  return `clicks:daily:${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const { naam, ref, sid } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const site = getSiteFromRequest(request);
    const redis = getRedis();
    const pipeline = redis.pipeline();
    const hk = hourKey();
    const dvk = dailyViewsKey();
    const dck = dailyClicksKey();

    pipeline.zincrby(redisKey(site, "views:leaderboard"), 1, naam.toLowerCase());
    pipeline.zincrby(redisKey(site, dvk), 1, naam.toLowerCase());
    pipeline.hincrby(redisKey(site, hk), "views", 1);
    pipeline.expire(redisKey(site, dvk), DAILY_VIEWS_TTL);

    if (sid && typeof sid === "string") {
      pipeline.pfadd(redisKey(site, "visitors"), sid);
      pipeline.pfadd(redisKey(site, `hv:${hk.slice(2)}`), sid);
      pipeline.pfadd(redisKey(site, dayKey()), sid);
    }

    // Track which site this view came from
    pipeline.zincrby("domains:views", 1, site.siteId);

    if (ref && typeof ref === "string" && ALLOWED_REFS.has(ref)) {
      pipeline.zincrby(redisKey(site, "clicks:leaderboard"), 1, naam.toLowerCase());
      pipeline.zincrby(redisKey(site, dck), 1, naam.toLowerCase());
      pipeline.zincrby(redisKey(site, "refs:leaderboard"), 1, ref);
      pipeline.hincrby(redisKey(site, hk), "clicks", 1);
      pipeline.expire(redisKey(site, dck), DAILY_CLICKS_TTL);
      pipeline.zincrby("domains:clicks", 1, site.siteId);
    }

    // Expire hourly keys after 8 days
    pipeline.expire(redisKey(site, hk), 691200);

    await pipeline.exec();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
