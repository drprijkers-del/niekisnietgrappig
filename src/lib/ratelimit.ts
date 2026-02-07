import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

export function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit. Returns true if request should be blocked.
 * Uses Redis INCR + EXPIRE (sliding window per key).
 */
export async function isRateLimited(
  redis: Redis,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const current = (await redis.get<number>(key)) ?? 0;
  if (current >= limit) return true;
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, windowSeconds);
  await pipeline.exec();
  return false;
}
