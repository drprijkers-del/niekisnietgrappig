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

// eslint-disable-next-line no-control-regex
const INVISIBLE_RE = /[\x00\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u2028\u2029\u00AD]/;

/** Detect invisible/zero-width characters that indicate encoding manipulation. */
function hasInvisibleChars(raw: string): boolean {
  try {
    const decoded = decodeURIComponent(raw);
    return INVISIBLE_RE.test(decoded);
  } catch {
    return false;
  }
}

/** Return an HTML page: "Max stop er eens mee?" */
function maxStopResponse(domain: string): Response {
  const html = `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Max stop er eens mee?</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#ededed;font-family:system-ui,sans-serif;padding:1.5rem}
.c{text-align:center;max-width:28rem}.e{font-size:3.75rem;margin-bottom:1rem}h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}
p{color:#71717a;font-size:.875rem;margin-bottom:1rem}a{color:#a1a1aa;font-size:.875rem;text-decoration:underline}a:hover{color:#fff}</style>
</head><body><div class="c"><div class="e">\u{1F6D1}</div><h1>Max stop er eens mee?</h1><p>Leuke poging met die character encoding. Werkt hier niet.</p><a href="https://${domain}">Terug naar de homepage</a></div></body></html>`;
  return new Response(html, {
    status: 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
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
    // Detect invisible/zero-width chars → "Max stop er eens mee?"
    if (INVISIBLE_RE.test(subdomainName)) {
      return maxStopResponse(site.domain);
    }

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
      // Detect invisible/zero-width chars in path → "Max stop er eens mee?"
      if (hasInvisibleChars(pathParts[0])) {
        return maxStopResponse(site.domain);
      }

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
