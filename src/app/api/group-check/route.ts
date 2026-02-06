import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const VIEWS_KEY = "views:leaderboard";
const GROUP_CHECK_KEY = "group_checks:total";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { names } = await request.json();

    if (!Array.isArray(names) || names.length < 2 || names.length > 20) {
      return NextResponse.json({ error: "Invalid names" }, { status: 400 });
    }

    // Validate and normalize names
    const validNames = names
      .filter((n): n is string => typeof n === "string" && n.length > 0 && n.length <= 50)
      .map((n) => n.toLowerCase().trim());

    if (validNames.length < 2) {
      return NextResponse.json({ error: "Need at least 2 names" }, { status: 400 });
    }

    const redis = getRedis();

    // Get scores for all names in one pipeline + track usage
    const pipeline = redis.pipeline();
    pipeline.incr(GROUP_CHECK_KEY); // Track group check usage
    for (const name of validNames) {
      pipeline.zscore(VIEWS_KEY, name);
    }

    const pipelineResults = await pipeline.exec();
    const scores = pipelineResults.slice(1); // Skip the incr result

    // Build results array
    // Easter egg: Dennis is the creator, always funny → 0 views (but show real count crossed out)
    const results = validNames
      .map((naam, i) => {
        const realViews = (scores[i] as number | null) ?? 0;
        const isDennis = naam === "dennis";
        return {
          naam,
          views: isDennis ? 0 : realViews,
          realViews: isDennis ? realViews : undefined, // Only include for Dennis
        };
      })
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
