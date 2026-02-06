import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawNaam = searchParams.get("naam") || "Iemand";
  const lang = searchParams.get("lang") === "en" ? "en" : "nl";
  const rawGroup = searchParams.get("g");
  const isEN = lang === "en";

  // Capitalize first letter of each word
  const naam = rawNaam
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Format group name
  const groupName = rawGroup
    ? rawGroup.split(/-+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : null;

  // Scale font for long names
  const len = naam.length;
  const mainSize = len > 20 ? 52 : len > 12 ? 64 : 80;
  const subSize = Math.round(mainSize * 0.85);

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
        {/* Top bar with red accent and optional group tag */}
        <div style={{ width: "100%", height: 6, backgroundColor: "#ef4444", display: "flex" }} />

        {/* Group tag - right aligned */}
        {groupName && (
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 20,
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b" }}>
              {groupName}
            </span>
          </div>
        )}

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          {/* Subtitle */}
          <div
            style={{
              fontSize: 22,
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              marginBottom: 28,
            }}
          >
            {isEN ? "OFFICIAL ANNOUNCEMENT" : "OFFICIEEL BEWEZEN"}
          </div>

          {/* Name — large and white */}
          <div
            style={{
              fontSize: mainSize,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {naam}
          </div>

          {/* "is niet grappig" */}
          <div
            style={{
              display: "flex",
              fontSize: subSize,
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            <span style={{ color: "#a1a1aa" }}>is </span>
            <span style={{ color: "#ef4444", marginLeft: 12, marginRight: 12 }}>
              {isEN ? "not" : "niet"}
            </span>
            <span style={{ color: "#a1a1aa" }}>{isEN ? "funny" : "grappig"}</span>
          </div>

          {/* Red divider */}
          <div style={{ width: 120, height: 2, backgroundColor: "#ef4444", marginTop: 36, marginBottom: 28, display: "flex" }} />

          {/* Description with name */}
          <div
            style={{
              fontSize: 24,
              color: "#52525b",
              textAlign: "center",
            }}
          >
            {isEN
              ? `Officially researched. Irrefutably documented.`
              : `Officieel onderzocht. Onomstotelijk vastgelegd.`}
          </div>
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
            {/* Favicon inline */}
            <svg width="32" height="32" viewBox="0 0 512 512">
              <rect width="512" height="512" rx="96" fill="#f59e0b"/>
              <line x1="136" y1="148" x2="216" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <line x1="376" y1="132" x2="296" y2="164" stroke="#0a0a0a" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="176" cy="208" r="28" fill="#0a0a0a"/>
              <circle cx="336" cy="208" r="38" fill="#0a0a0a"/>
              <rect x="144" y="328" width="224" height="24" rx="12" fill="#0a0a0a"/>
            </svg>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#52525b" }}>
              {isEN ? "isntfunny" : "isnietgrappig"}
              <span style={{ color: "#ef4444" }}>.com</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#3f3f46" }}>
            {isEN ? "Share the truth" : "Deel de waarheid"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
