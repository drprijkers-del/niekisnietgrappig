import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const VIEWS_KEY = "views:leaderboard";
const REFS_KEY = "refs:leaderboard";

const ALLOWED_REFS = new Set(["wa", "copy", "x", "ig", "tiktok", "fb", "email"]);

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { naam, ref } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.zincrby(VIEWS_KEY, 1, naam.toLowerCase());

    if (ref && typeof ref === "string" && ALLOWED_REFS.has(ref)) {
      pipeline.zincrby(REFS_KEY, 1, ref);
    }

    await pipeline.exec();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
