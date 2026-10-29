import { isUUID } from 'utils/helperUtils';

import { QuickSearchEntry } from './filterEntries';

// A few more are kept than shown, because the current page is hidden and the
// user may have lost access to some places since.
const MAX_STORED = 20;
const MAX_SHOWN = 10;

const storageKey = (userId: string) => `admin-quick-search-recent:${userId}`;

export const readRecentKeys = (userId: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(storageKey(userId)) ?? '[]'
    );
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === 'string')
      : [];
  } catch {
    return [];
  }
};

export const writeRecentKeys = (userId: string, keys: string[]) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(keys));
  } catch {
    return;
  }
};

export const addRecentKey = (keys: string[], key: string) =>
  [key, ...keys.filter((recentKey) => recentKey !== key)].slice(0, MAX_STORED);

const trimTrailingSlash = (path: string) => path.replace(/\/+$/, '');

// Fills in the route params, e.g. /admin/projects/$projectId → /admin/projects/1.
const entryPath = (entry: QuickSearchEntry) =>
  trimTrailingSlash(
    entry.link.to.replace(
      /\$(\w+)/g,
      (param, name: string) => entry.link.params?.[name] ?? param
    )
  );

// Whether the entry's path is the given path or a whole-segment prefix of it.
// An id further down the path points at a specific record (e.g. a campaign
// under /admin/messaging), which is a different place, so it doesn't count.
const isMatch = (path: string, candidate: string) => {
  if (path === candidate) return true;
  if (!path.startsWith(`${candidate}/`)) return false;

  return !path
    .slice(candidate.length + 1)
    .split('/')
    .some(isUUID);
};

// The entry with the longest matching path, so a phase's sub-pages all match
// that phase.
export const matchEntry = (path: string, entries: QuickSearchEntry[]) => {
  const trimmedPath = trimTrailingSlash(path);
  let bestMatch: QuickSearchEntry | undefined;
  let bestLength = 0;

  entries.forEach((entry) => {
    const candidate = entryPath(entry);
    if (isMatch(trimmedPath, candidate) && candidate.length > bestLength) {
      bestMatch = entry;
      bestLength = candidate.length;
    }
  });

  return bestMatch;
};

export const entryKey = (entry: QuickSearchEntry) =>
  `${entry.group}-${entry.id}`;

// Recent keys as entries, newest first. Leaves out the current page and
// anything the user can no longer reach (it is not among the entries).
export const getRecentEntries = (
  keys: string[],
  entries: QuickSearchEntry[],
  currentKey: string | undefined
) => {
  const entriesByKey = new Map(
    entries.map((entry) => [entryKey(entry), entry])
  );

  return keys
    .filter((key) => key !== currentKey)
    .flatMap((key) => entriesByKey.get(key) ?? [])
    .slice(0, MAX_SHOWN);
};
