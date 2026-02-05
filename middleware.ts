import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Extract subdomain from isnietgrappig.nl
  const match = hostname.match(/^([a-z0-9-]+)\.isnietgrappig\.nl$/i);

  if (match && match[1] !== "www") {
    const naam = match[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${naam}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
