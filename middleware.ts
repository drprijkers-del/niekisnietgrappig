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

  // Root domain with path-based name → redirect to subdomain
  const isRootNL = /^(www\.)?isnietgrappig\.com$/i.test(hostname);
  const isRootEN = /^(www\.)?isntfunny\.com$/i.test(hostname);

  if (isRootNL || isRootEN) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const naam = pathParts[0];
      const baseDomain = isRootNL ? "isnietgrappig.com" : "isntfunny.com";
      const rest = pathParts.slice(1).join("/");
      const redirectUrl = new URL(`https://${naam}.${baseDomain}${rest ? `/${rest}` : ""}`);
      url.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(redirectUrl, 301);
    }

    // Root isntfunny.com without path → add ?lang=en
    if (isRootEN && !url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
