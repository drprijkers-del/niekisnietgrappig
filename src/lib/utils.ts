export function capitalizeName(input: string): string {
  return decodeURIComponent(input)
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/(^|[\s'-])(\S)/gu, (_, separator, char) =>
      separator + char.toUpperCase()
    );
}

export function validateSpice(w: string | undefined | null): string | null {
  if (!w || typeof w !== "string") return null;
  const cleaned = w.trim().toLowerCase();
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
