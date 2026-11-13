import { TypedLinkProps, WrapperTo } from 'utils/cl-router/Link';

type QuickSearchGroup = 'pages' | 'spaces' | 'folders' | 'projects' | 'phases';

export type QuickSearchEntry = {
  id: string;
  group: QuickSearchGroup;
  // Shown as a breadcrumb trail, ending with the page the entry links to.
  breadcrumbs: string[];
  link: TypedLinkProps & { to: NonNullable<WrapperTo> };
  // Extra text that matches the entry without being shown, e.g. its path.
  keywords?: string;
};

// Capped per group, so a broad query still shows some projects and phases.
const MAX_RESULTS_PER_GROUP = 15;

// Lowercase and strip accents, so "reunion" finds "Réunion".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

// Every word of the query must appear somewhere in the entry, in any order.
// Entries whose own name matches come first, ahead of entries that only match
// through their parents (e.g. every phase of a matching project), so the cap
// doesn't drop the closest matches.
const filterEntries = (entries: QuickSearchEntry[], query: string) => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const matchesAll = (text: string) => {
    const normalized = normalize(text);
    return words.every((word) => normalized.includes(word));
  };

  const nameMatches: QuickSearchEntry[] = [];
  const otherMatches: QuickSearchEntry[] = [];
  entries.forEach((entry) => {
    if (!matchesAll([...entry.breadcrumbs, entry.keywords].join(' '))) return;

    const name = entry.breadcrumbs.slice(-1).join(' ');
    (matchesAll(name) ? nameMatches : otherMatches).push(entry);
  });

  const countPerGroup: Partial<Record<QuickSearchGroup, number>> = {};

  return [...nameMatches, ...otherMatches].filter((entry) => {
    const count = countPerGroup[entry.group] ?? 0;
    countPerGroup[entry.group] = count + 1;
    return count < MAX_RESULTS_PER_GROUP;
  });
};

export default filterEntries;
