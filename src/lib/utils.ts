export function capitalizeName(input: string): string {
  return decodeURIComponent(input)
    .toLowerCase()
    .replace(/(^|[\s-])(\w)/g, (_, separator, char) =>
      separator + char.toUpperCase()
    );
}
