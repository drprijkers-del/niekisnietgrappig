"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function LanguageToggle({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggle = () => {
    const newLang = lang === "nl" ? "en" : "nl";
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
