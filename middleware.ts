import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Subdomain pattern for both domains
  const nlMatch = hostname.match(/^([a-z0-9-]+)\.isnietgrappig\.com$/i);
  const enMatch = hostname.match(/^([a-z0-9-]+)\.isntfunny\.com$/i);

  const match = nlMatch || enMatch;

  if (match && match[1] !== "www") {
    const naam = match[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${naam}${url.pathname === "/" ? "" : url.pathname}`;

    // Auto-set language based on domain
    if (enMatch && !url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
    }

    return NextResponse.rewrite(url);
  }

  // Root domain isntfunny.com without subdomain → default to English
  if (hostname.match(/^(www\.)?isntfunny\.com$/i)) {
    const url = request.nextUrl.clone();
    if (!url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
    }
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
