"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NameForm({
  placeholder,
  button,
  lang,
}: {
  placeholder: string;
  button: string;
  lang: string;
}) {
  const [naam, setNaam] = useState("");
  const [spice, setSpice] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = naam.trim();
    if (!trimmed) return;

    const slug = encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, "-"));
    const params = new URLSearchParams();
    if (lang === "en") params.set("lang", "en");

    const w = spice.trim().toLowerCase();
    if (w && /^[\p{L}0-9-]+$/u.test(w) && w.length <= 20) {
      params.set("w", w);
    }

    const qs = params.toString();
    router.push(`/${slug}${qs ? `?${qs}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-3"
    >
      <input
        type="text"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        required
        maxLength={50}
        autoFocus
      />
      <input
        type="text"
        value={spice}
        onChange={(e) => setSpice(e.target.value.replace(/\s/g, ""))}
        placeholder={lang === "en" ? "🌶️  Add spice — work, gym, cooking..." : "🌶️  Add spice — werk, gym, koken..."}
        className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        maxLength={20}
      />
      <button
        type="submit"
        className="w-full rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-all hover:bg-red-500"
      >
        {button}
      </button>
    </form>
  );
}
