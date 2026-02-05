/**
 * Seed script — populates Redis with realistic test data for the last 7 days.
 *
 * Usage:
 *   npx tsx scripts/seed-stats.ts
 *
 * Requires env vars: KV_REST_API_URL, KV_REST_API_TOKEN
 * (reads from .env.local)
 */

import { readFileSync } from "fs";
import { Redis } from "@upstash/redis";

// Load .env.local manually (no dotenv dependency)
try {
  const envFile = readFileSync(".env.local", "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  console.log("No .env.local found, using environment variables");
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// ── Config ────────────────────────────────────────────────────────
const NAMES = [
  "niek", "dennis", "jan", "piet", "kees", "sophie", "lisa",
  "mark", "trump", "sander", "emma", "tim", "max", "julia",
];

const REFS = ["wa", "copy", "x", "ig", "tiktok", "fb", "email"];
const REF_WEIGHTS = [40, 25, 15, 8, 5, 5, 2]; // WhatsApp dominant

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ── Seed ──────────────────────────────────────────────────────────
async function seed() {
  console.log("Seeding stats data for last 7 days...\n");

  const now = Date.now();
  const pipeline = redis.pipeline();

  // Name weights — niek and dennis are most popular
  const nameWeights = NAMES.map((n) =>
    n === "niek" ? 30 : n === "dennis" ? 20 : n === "trump" ? 10 : Math.floor(Math.random() * 8) + 2
  );

  let totalViews = 0;
  let totalClicks = 0;
  let totalShares = 0;
  const sessionIds: string[] = [];

  // Generate ~200 unique "visitors"
  for (let i = 0; i < 200; i++) {
    sessionIds.push(`seed-${crypto.randomUUID()}`);
  }

  // For each hour in the last 7 days
  for (let hourOffset = 0; hourOffset < 168; hourOffset++) {
    const ts = now - hourOffset * 3600_000;
    const d = new Date(ts);
    const hk = `h:${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}`;
    const dk = `dv:${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

    // Simulate traffic pattern: more during day (8-23h), less at night
    const hour = d.getUTCHours();
    const dayMultiplier = hour >= 8 && hour <= 23 ? 1.5 : 0.3;
    // More recent = more traffic (viral growth)
    const recencyMultiplier = 1 + (168 - hourOffset) / 168;

    const baseEvents = Math.floor(3 * dayMultiplier * recencyMultiplier + Math.random() * 4);

    let hourViews = 0;
    let hourClicks = 0;
    let hourShares = 0;

    for (let e = 0; e < baseEvents; e++) {
      const naam = weightedPick(NAMES, nameWeights);
      const sid = sessionIds[Math.floor(Math.random() * sessionIds.length)];
      const domain = Math.random() > 0.3 ? "nl" : "en";

      // View
      pipeline.zincrby("views:leaderboard", 1, naam);
      pipeline.pfadd("visitors", sid);
      pipeline.pfadd(`hv:${hk.slice(2)}`, sid);
      pipeline.pfadd(dk, sid);
      pipeline.zincrby("domains:views", 1, domain);
      hourViews++;
      totalViews++;

      // ~40% chance of being a click from a shared link
      if (Math.random() < 0.4) {
        const ref = weightedPick(REFS, REF_WEIGHTS);
        pipeline.zincrby("clicks:leaderboard", 1, naam);
        pipeline.zincrby("refs:leaderboard", 1, ref);
        pipeline.zincrby("domains:clicks", 1, domain);
        hourClicks++;
        totalClicks++;
      }

      // ~25% chance of sharing
      if (Math.random() < 0.25) {
        pipeline.zincrby("shares:leaderboard", 1, naam);
        pipeline.pfadd("sharers", sid);
        pipeline.zincrby("domains:shares", 1, domain);
        const ttShare = Math.floor(Math.random() * 60) + 5;
        pipeline.incrbyfloat("share_timing:sum", ttShare);
        pipeline.incrby("share_timing:count", 1);
        hourShares++;
        totalShares++;
      }
    }

    // Set hourly hash
    if (hourViews > 0) pipeline.hincrby(hk, "views", hourViews);
    if (hourClicks > 0) pipeline.hincrby(hk, "clicks", hourClicks);
    if (hourShares > 0) pipeline.hincrby(hk, "shares", hourShares);
    pipeline.expire(hk, 691200); // 8 days
  }

  console.log(`Executing pipeline (~${totalViews} views, ~${totalClicks} clicks, ~${totalShares} shares)...`);
  await pipeline.exec();

  console.log("\nSeed complete!");
  console.log(`  Views:  ${totalViews}`);
  console.log(`  Clicks: ${totalClicks}`);
  console.log(`  Shares: ${totalShares}`);
  console.log(`  Names:  ${NAMES.length}`);
  console.log(`\nOpen: http://localhost:3000/stats?key=YOUR_STATS_SECRET`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
