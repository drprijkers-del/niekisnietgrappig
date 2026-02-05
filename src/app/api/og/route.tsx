import { ImageResponse } from "next/og";
import { capitalizeName } from "@/lib/utils";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawNaam = searchParams.get("naam") || "Iemand";
  const lang = searchParams.get("lang") === "en" ? "en" : "nl";
  const naam = capitalizeName(rawNaam);

  const isEN = lang === "en";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#71717a",
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          {isEN
            ? "A public service announcement"
            : "Een publieke dienstaankondiging"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 900,
            gap: 16,
          }}
        >
          <span>{naam} is</span>
          <span style={{ color: "#ef4444" }}>{isEN ? "not" : "niet"}</span>
          <span>{isEN ? "funny" : "grappig"}</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#71717a",
            marginTop: 30,
          }}
        >
          {isEN ? "The proof is here." : "Het bewijs is hier."}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
