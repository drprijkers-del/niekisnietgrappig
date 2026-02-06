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
  const [groep, setGroep] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Validate name: only letters, spaces, apostrophes, dots, hyphens
  const isValidName = (name: string) => /^[\p{L}\s'.-]+$/u.test(name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = naam.trim();
    if (!trimmed) return;

    if (!isValidName(trimmed)) {
      setError(lang === "en" ? "Only letters allowed, no numbers" : "Alleen letters, geen cijfers");
      return;
    }

    setError("");
    const slug = encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, "-"));
    const params = new URLSearchParams();
    if (lang === "en") params.set("lang", "en");

    const w = spice.trim().toLowerCase();
    if (w && /^[\p{L}0-9-]+$/u.test(w) && w.length <= 20) {
      params.set("w", w);
    }

    const g = groep.trim().toLowerCase();
    if (g && /^[a-z0-9-]+$/.test(g) && g.length <= 24) {
      params.set("g", g);
    }

    const qs = params.toString();
    router.push(`/${slug}${qs ? `?${qs}` : ""}`);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNaam(e.target.value);
    if (error) setError(""); // Clear error when typing
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-3"
    >
      <div>
        <input
          type="text"
          value={naam}
          onChange={handleNameChange}
          placeholder={placeholder}
          className={`w-full rounded-full border bg-zinc-900 px-6 py-3 text-white placeholder-zinc-500 focus:outline-none ${
            error ? "border-red-500" : "border-zinc-700 focus:border-zinc-500"
          }`}
          required
          maxLength={50}
          autoFocus
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400 text-center">{error}</p>
        )}
      </div>
      <input
        type="text"
        value={spice}
        onChange={(e) => setSpice(e.target.value.replace(/\s/g, ""))}
        placeholder={lang === "en" ? "🌶️  Add spice — work, gym, cooking..." : "🌶️  Add spice — werk, gym, koken..."}
        className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        maxLength={20}
      />
      <input
        type="text"
        value={groep}
        onChange={(e) => setGroep(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        placeholder={lang === "en" ? "🏷️  Group tag (optional)" : "🏷️  Groepstag (optioneel)"}
        className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        maxLength={24}
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
