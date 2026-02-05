import { ImageResponse } from "next/og";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

function capitalize(s: string) {
  return s.replace(/(^|[\s'-])(\S)/g, (_, sep, c) => sep + c.toUpperCase());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || key !== process.env.STATS_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  // Fetch top 10 by views
  const viewsRaw = await redis.zrange<string[]>(
    "views:leaderboard", 0, 9, { rev: true, withScores: true }
  );

  const entries: { naam: string; views: number }[] = [];
  for (let i = 0; i < (viewsRaw?.length || 0); i += 2) {
    entries.push({ naam: viewsRaw[i], views: Number(viewsRaw[i + 1]) });
  }

  const topViews = entries[0]?.views || 1;
  const now = new Date();
  const dateStr = `${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
          color: "#ededed",
        }}
      >
        {/* Top red accent bar */}
        <div style={{ width: "100%", height: 6, backgroundColor: "#ef4444", display: "flex" }} />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 28,
            paddingBottom: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 18,
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
              }}
            >
              Leaderboard
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 6, display: "flex" }}>
              Wie is het minst grappig?
            </div>
          </div>
          <div style={{ fontSize: 16, color: "#52525b", display: "flex" }}>
            {dateStr}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, backgroundColor: "#27272a", display: "flex" }} />

        {/* Leaderboard rows — only top 5 for readability */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 12,
            paddingBottom: 12,
            justifyContent: "center",
          }}
        >
          {entries.slice(0, 5).map((entry, i) => (
            <div
              key={entry.naam}
              style={{
                display: "flex",
                alignItems: "center",
                paddingTop: i === 0 ? 14 : 10,
                paddingBottom: i === 0 ? 14 : 10,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontSize: i === 0 ? 48 : 32,
                  fontWeight: 900,
                  color: i === 0 ? "#ef4444" : i < 3 ? "#a1a1aa" : "#52525b",
                  width: 70,
                  display: "flex",
                }}
              >
                {i + 1}
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: i === 0 ? 48 : 32,
                  fontWeight: i === 0 ? 900 : 700,
                  color: i === 0 ? "#ffffff" : "#d4d4d8",
                  flexGrow: 1,
                  display: "flex",
                }}
              >
                {capitalize(entry.naam)}
              </div>

              {/* Bar + count */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, width: 380 }}>
                <div
                  style={{
                    display: "flex",
                    width: 260,
                    height: i === 0 ? 20 : 14,
                    backgroundColor: "#1c1c1c",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(entry.views / topViews) * 100}%`,
                      height: "100%",
                      backgroundColor: i === 0 ? "#ef4444" : i < 3 ? "#dc2626" : "#7f1d1d",
                      borderRadius: 99,
                      display: "flex",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: i === 0 ? 32 : 24,
                    fontWeight: 700,
                    color: i === 0 ? "#ef4444" : "#71717a",
                    width: 100,
                    textAlign: "right",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {entry.views.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 20,
            paddingBottom: 20,
            borderTop: "1px solid #27272a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Favicon inline */}
            <svg width="36" height="36" viewBox="0 0 512 512">
              <rect width="512" height="512" rx="96" fill="#f59e0b"/>
              <line x1="136" y1="148" x2="216" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <line x1="376" y1="132" x2="296" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="176" cy="208" r="28" fill="#0a0a0a"/>
              <circle cx="336" cy="208" r="38" fill="#0a0a0a"/>
              <rect x="144" y="328" width="224" height="24" rx="12" fill="#0a0a0a"/>
            </svg>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: "#52525b" }}>
              isnietgrappig<span style={{ color: "#ef4444" }}>.com</span>
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#52525b" }}>
            Deel de waarheid
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
