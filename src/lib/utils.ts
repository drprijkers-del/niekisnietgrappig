/**
 * Strip diacritics and normalize to ASCII slug for URLs/subdomains.
 * "Amélie" → "amelie", "Jean-Pierre" → "jean-pierre", "O'Brien" → "obrien"
 */
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Safely decode a URI component — returns fallback on malformed input. */
export function safeDecode(input: string, fallback?: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return fallback ?? input;
  }
}

/** Strip null bytes, zero-width chars, and other invisible control characters. */
export function stripInvisible(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u2028\u2029\u00AD]/g, "");
}

export function capitalizeName(input: string): string {
  return stripInvisible(safeDecode(input))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/(^|[\s'-])(\S)/gu, (_, separator, char) =>
      separator + char.toUpperCase()
    );
}

export function validateSpice(w: string | undefined | null): string | null {
  if (!w || typeof w !== "string") return null;
  const cleaned = stripInvisible(w).trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > 20) return null;
  if (!/^[\p{L}0-9-]+$/u.test(cleaned)) return null;
  return cleaned;
}

export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (state >>> 0) / 0xffffffff;
  };
}
