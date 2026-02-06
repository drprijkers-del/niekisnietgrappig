import { ImageResponse } from "next/og";
import { getSiteByDomain } from "@/lib/sites";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const namesParam = searchParams.get("names") || "";
  const scoresParam = searchParams.get("scores") || "";
  const lang = searchParams.get("lang") === "en" ? "en" : "nl";

  const host = request.headers.get("host") || "";
  const site = getSiteByDomain(host);
  const isEN = lang === "en" && site.hasEnglish;
  const accentColor = site.accentColor;

  // Parse names and scores
  const names = namesParam.split(",").filter(Boolean).slice(0, 5);
  const scores = scoresParam.split(",").map(Number);

  // Capitalize names
  const capitalize = (s: string) =>
    s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  const results = names.map((name, i) => ({
    name: capitalize(name),
    score: scores[i] || 0,
  }));

  const winner = results[0];

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
        {/* Top bar */}
        <div style={{ width: "100%", height: 6, backgroundColor: accentColor, display: "flex" }} />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            padding: 40,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <span style={{ fontSize: 28 }}>🔥</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {isEN ? "Battle Results" : site.battle.resultTitle}
            </span>
          </div>

          {/* Winner highlight */}
          {winner ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 18, color: "#71717a", marginBottom: 8 }}>
                {isEN ? "Least funny:" : site.battle.leastLabel}
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: accentColor }}>
                {winner.name}
              </div>
              <div style={{ fontSize: 20, color: "#71717a", marginTop: 8 }}>
                {winner.score}x {isEN ? "views" : site.battle.viewsLabel}
              </div>
            </div>
          ) : null}

          {/* Leaderboard */}
          {results.length > 1 ? (
            <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 500, gap: 12 }}>
              {results.slice(1).map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    backgroundColor: "#18181b",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 18, color: "#52525b", width: 28 }}>{i + 2}.</span>
                    <span style={{ fontSize: 20, fontWeight: 600 }}>
                      {r.name}
                      {r.name.toLowerCase() === "dennis" && site.siteId === "grappig" ? (
                        <span style={{ fontSize: 14, color: "#52525b", fontStyle: "italic", marginLeft: 8 }}>
                          (seriously?)
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span style={{ fontSize: 18, color: "#71717a" }}>{r.score}x</span>
                </div>
              ))}
            </div>
          ) : null}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="32" height="32" viewBox="0 0 512 512">
              <rect width="512" height="512" rx="96" fill={accentColor}/>
              <line x1="136" y1="148" x2="216" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <line x1="376" y1="132" x2="296" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="176" cy="208" r="28" fill="#0a0a0a"/>
              <circle cx="336" cy="208" r="38" fill="#0a0a0a"/>
              <rect x="144" y="328" width="224" height="24" rx="12" fill="#0a0a0a"/>
            </svg>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#52525b" }}>
              {isEN && site.domainEn ? site.domainEn.replace(/\.[^.]+$/, "") : site.og.footerLabel}
              <span style={{ color: accentColor }}>{isEN && site.domainEn ? site.domainEn.replace(/^[^.]+/, "") : site.og.footerTLD}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#3f3f46" }}>
            {isEN ? "Check your friends" : "Check je vriendengroep"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}
