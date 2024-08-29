export function extractIdsFromValue(value: string): string[] {
  const regex = /@\[.*?\]\((.*?)\)/g;
  const matches = [...value.matchAll(regex)];

  return matches.map((match) => match[1]);
}
