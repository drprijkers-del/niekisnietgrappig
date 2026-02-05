import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Subdomain pattern for both domains
  const nlMatch = hostname.match(/^([^.]+)\.isnietgrappig\.com$/i);
  const enMatch = hostname.match(/^([^.]+)\.isntfunny\.com$/i);

  const match = nlMatch || enMatch;

  if (match && match[1] !== "www") {
    const naam = match[1];
    url.pathname = `/${naam}${url.pathname === "/" ? "" : url.pathname}`;

    if (enMatch && !url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
    }

    return NextResponse.rewrite(url);
  }

  // Root domain isntfunny.com → redirect to add ?lang=en if missing
  if (
    hostname.match(/^(www\.)?isntfunny\.com$/i) &&
    !url.searchParams.has("lang")
  ) {
    url.searchParams.set("lang", "en");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
