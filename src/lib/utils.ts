export function capitalizeName(input: string): string {
  return decodeURIComponent(input)
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/(^|[\s'-])(\S)/gu, (_, separator, char) =>
      separator + char.toUpperCase()
    );
}
