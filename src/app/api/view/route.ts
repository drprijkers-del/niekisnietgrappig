import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const VIEWS_KEY = "views:leaderboard";
const CLICKS_KEY = "clicks:leaderboard";
const REFS_KEY = "refs:leaderboard";
const DOMAIN_VIEWS_KEY = "domains:views";
const DOMAIN_CLICKS_KEY = "domains:clicks";

const ALLOWED_REFS = new Set(["wa", "copy", "x", "ig", "tiktok", "fb", "email"]);

function getDomain(request: NextRequest): "nl" | "en" | null {
  const host = request.headers.get("host") || "";
  if (host.includes("isnietgrappig.com")) return "nl";
  if (host.includes("isntfunny.com")) return "en";
  return null;
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

function dayKey() {
  const d = new Date();
  return `dv:${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const { naam, ref, sid } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const redis = getRedis();
    const pipeline = redis.pipeline();
    const hk = hourKey();

    pipeline.zincrby(VIEWS_KEY, 1, naam.toLowerCase());
    pipeline.hincrby(hk, "views", 1);

    if (sid && typeof sid === "string") {
      pipeline.pfadd("visitors", sid);
      pipeline.pfadd(`hv:${hk.slice(2)}`, sid);
      pipeline.pfadd(dayKey(), sid);
    }

    const domain = getDomain(request);
    if (domain) {
      pipeline.zincrby(DOMAIN_VIEWS_KEY, 1, domain);
    }

    if (ref && typeof ref === "string" && ALLOWED_REFS.has(ref)) {
      pipeline.zincrby(CLICKS_KEY, 1, naam.toLowerCase());
      pipeline.zincrby(REFS_KEY, 1, ref);
      pipeline.hincrby(hk, "clicks", 1);
      if (domain) {
        pipeline.zincrby(DOMAIN_CLICKS_KEY, 1, domain);
      }
    }

    // Expire hourly keys after 8 days
    pipeline.expire(hk, 691200);

    await pipeline.exec();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
