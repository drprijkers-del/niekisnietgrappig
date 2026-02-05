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
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = naam.trim();
    if (trimmed) {
      const slug = encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, "-"));
      const langParam = lang === "en" ? "?lang=en" : "";
      router.push(`/${slug}${langParam}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-3"
    >
      <input
        type="text"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        required
        maxLength={50}
        autoFocus
      />
      <button
        type="submit"
        className="rounded-full bg-red-600 px-8 py-3 font-medium text-white transition-all hover:bg-red-500"
      >
        {button}
      </button>
    </form>
  );
}
