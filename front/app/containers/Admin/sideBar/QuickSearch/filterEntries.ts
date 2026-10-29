import { TypedLinkProps, WrapperTo } from 'utils/cl-router/Link';

export type QuickSearchGroup = 'pages' | 'projects' | 'phases';

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
const filterEntries = (entries: QuickSearchEntry[], query: string) => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const countPerGroup: Partial<Record<QuickSearchGroup, number>> = {};

  return entries.filter((entry) => {
    const haystack = normalize(
      [...entry.breadcrumbs, entry.keywords].join(' ')
    );
    if (!words.every((word) => haystack.includes(word))) return false;

    const count = countPerGroup[entry.group] ?? 0;
    countPerGroup[entry.group] = count + 1;
    return count < MAX_RESULTS_PER_GROUP;
  });
};

export default filterEntries;
