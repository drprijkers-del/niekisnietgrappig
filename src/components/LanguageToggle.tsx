"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const DOMAIN_MAP: Record<string, string> = {
  "isnietgrappig.com": "isntfunny.com",
  "isntfunny.com": "isnietgrappig.com",
};

export default function LanguageToggle({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggle = () => {
    const hostname = window.location.hostname;
    const newLang = lang === "nl" ? "en" : "nl";

    // Check if we're on a custom domain with subdomain (e.g. niek.isnietgrappig.com)
    const subdomainNL = hostname.match(/^(.+)\.isnietgrappig\.com$/);
    const subdomainEN = hostname.match(/^(.+)\.isntfunny\.com$/);
    const subdomain = subdomainNL || subdomainEN;

    if (subdomain && subdomain[1] !== "www") {
      // Switch to the other domain, keeping the subdomain
      const baseDomain = subdomainNL ? "isntfunny.com" : "isnietgrappig.com";
      window.location.href = `https://${subdomain[1]}.${baseDomain}${pathname}`;
      return;
    }

    // Check if we're on a root custom domain (no subdomain)
    const rootNL = hostname === "isnietgrappig.com" || hostname === "www.isnietgrappig.com";
    const rootEN = hostname === "isntfunny.com" || hostname === "www.isntfunny.com";

    if (rootNL || rootEN) {
      const targetDomain = rootNL ? "isntfunny.com" : "isnietgrappig.com";
      window.location.href = `https://${targetDomain}${pathname}`;
      return;
    }

    // Fallback: use query param (for vercel.app domain / localhost)
    const params = new URLSearchParams(searchParams.toString());
    if (newLang === "nl") {
      params.delete("lang");
    } else {
      params.set("lang", newLang);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-zinc-800 hover:border-zinc-500"
    >
      <span className={lang === "nl" ? "opacity-100" : "opacity-40"}>NL</span>
      <span className="text-zinc-600">/</span>
      <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
    </button>
  );
}
