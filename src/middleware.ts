import { NextRequest, NextResponse } from "next/server";
import { ALL_SITES, SITES, lookupDomain, type SiteConfig, type SiteId } from "@/lib/sites";

/** Normalize a subdomain to ASCII (strip diacritics, remove non-alphanumeric). */
function normalizeSubdomain(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // ── Dev overrides: ?_site=xxx / ?_lang=xx → set cookies, redirect ──
  const siteParam = url.searchParams.get("_site");
  const langParam = url.searchParams.get("_lang");

  if (siteParam || langParam) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("_site");
    clean.searchParams.delete("_lang");
    // Carry _lang as the regular lang param for the page
    if (langParam) clean.searchParams.set("lang", langParam);

    const response = NextResponse.redirect(clean);
    if (siteParam) {
      response.cookies.set("pl_site", siteParam, { path: "/", httpOnly: false, maxAge: 86400 });
    }
    if (langParam) {
      response.cookies.set("pl_lang", langParam, { path: "/", httpOnly: false, maxAge: 86400 });
    }
    return response;
  }

  // ── Resolve site from domain → cookie → default ──
  const domResult = lookupDomain(hostname);
  const cookieSiteId = request.cookies.get("pl_site")?.value as SiteId | undefined;

  const site: SiteConfig = domResult
    ? domResult.site
    : cookieSiteId && SITES[cookieSiteId]
      ? SITES[cookieSiteId]
      : SITES.grappig;

  // ── Subdomain detection (niek.isnietgrappig.com → rewrite to /niek) ──
  let subdomainName: string | null = null;
  let isEnglishDomain = false;

  for (const s of ALL_SITES.filter((x) => x.enabled)) {
    const nlMatch = hostname.match(new RegExp(`^([^.]+)\\.${s.domain.replace(/\./g, "\\.")}$`, "i"));
    if (nlMatch && nlMatch[1] !== "www") {
      subdomainName = nlMatch[1];
      break;
    }
    if (s.shareDomain) {
      const shareMatch = hostname.match(new RegExp(`^([^.]+)\\.${s.shareDomain.replace(/\./g, "\\.")}$`, "i"));
      if (shareMatch && shareMatch[1] !== "www") {
        subdomainName = shareMatch[1];
        break;
      }
    }
    if (s.domainEn) {
      const enMatch = hostname.match(new RegExp(`^([^.]+)\\.${s.domainEn.replace(/\./g, "\\.")}$`, "i"));
      if (enMatch && enMatch[1] !== "www") {
        subdomainName = enMatch[1];
        isEnglishDomain = true;
        break;
      }
    }
  }

  if (subdomainName) {
    // Punycode subdomains (xn--) can't be reliably decoded in Edge Runtime — redirect to root
    if (subdomainName.startsWith("xn--")) {
      const baseDomain = isEnglishDomain
        ? ALL_SITES.find((s) => s.domainEn && hostname.includes(s.domainEn))?.domainEn || site.domain
        : site.domain;
      return NextResponse.redirect(new URL(`https://${baseDomain}`), 302);
    }

    // Normalize unicode subdomains to ASCII (é→e, ö→o, etc.)
    subdomainName = normalizeSubdomain(subdomainName);
    if (!subdomainName) {
      return NextResponse.redirect(new URL(`https://${site.domain}`), 302);
    }

    url.pathname = `/${subdomainName}${url.pathname === "/" ? "" : url.pathname}`;

    if (isEnglishDomain && !url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-id", site.siteId);

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // ── Root domain with path-based name → redirect to subdomain ──
  const host = hostname.split(":")[0].toLowerCase();
  const isRoot = host === site.domain || host === `www.${site.domain}`;
  const isRootShare = site.shareDomain && (host === site.shareDomain || host === `www.${site.shareDomain}`);
  const isRootEn = site.domainEn && (host === site.domainEn || host === `www.${site.domainEn}`);

  const RESERVED_PATHS = new Set(["stats", "battle"]);

  if (isRoot || isRootShare || isRootEn) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0 && !RESERVED_PATHS.has(pathParts[0])) {
      // Normalize naam to ASCII for subdomain safety
      let rawNaam: string;
      try { rawNaam = decodeURIComponent(pathParts[0]); } catch { rawNaam = pathParts[0]; }
      const naam = normalizeSubdomain(rawNaam) || pathParts[0];
      const baseDomain = isRootEn ? site.domainEn! : isRootShare ? site.shareDomain! : site.domain;
      const rest = pathParts.slice(1).join("/");
      const redirectUrl = new URL(`https://${naam}.${baseDomain}${rest ? `/${rest}` : ""}`);
      url.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(redirectUrl, 301);
    }

    // Root English domain without lang → add ?lang=en
    if (isRootEn && !url.searchParams.has("lang")) {
      url.searchParams.set("lang", "en");
      return NextResponse.redirect(url);
    }
  }

  // ── Default: forward with x-site-id header (best effort) ──
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-id", site.siteId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\.svg|api/).*)"],
};
