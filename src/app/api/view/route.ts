import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const VIEWS_KEY = "views:leaderboard";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { naam } = await request.json();
    if (!naam || typeof naam !== "string" || naam.length > 50) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const redis = getRedis();
    await redis.zincrby(VIEWS_KEY, 1, naam.toLowerCase());

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
