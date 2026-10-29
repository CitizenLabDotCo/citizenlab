import { isUUID } from 'utils/helperUtils';

import { QuickSearchEntry } from './filterEntries';

// More paths are kept than shown, because several paths can lead to the same
// entry (e.g. a phase's setup and ideas pages both show as that phase).
const MAX_STORED = 30;
const MAX_SHOWN = 10;

const storageKey = (userId: string) => `admin-quick-search-recent:${userId}`;

export const readRecentPaths = (userId: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(storageKey(userId)) ?? '[]'
    );
    return Array.isArray(parsed)
      ? parsed.filter((path): path is string => typeof path === 'string')
      : [];
  } catch {
    return [];
  }
};

export const writeRecentPaths = (userId: string, paths: string[]) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(paths));
  } catch {
    return;
  }
};

export const addRecentPath = (paths: string[], path: string) =>
  [path, ...paths.filter((recentPath) => recentPath !== path)].slice(
    0,
    MAX_STORED
  );

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
// A prefix followed by an id points at a specific record (e.g. a project under
// /admin/projects), which is a different place, so it doesn't count.
const isMatch = (path: string, candidate: string) => {
  if (path === candidate) return true;
  if (!path.startsWith(`${candidate}/`)) return false;

  const nextSegment = path.slice(candidate.length + 1).split('/')[0];
  return !isUUID(nextSegment);
};

// The entry with the longest matching path, so a phase's sub-pages all match
// that phase.
const matchEntry = (path: string, entries: QuickSearchEntry[]) => {
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

const entryKey = (entry: QuickSearchEntry) => `${entry.group}-${entry.id}`;

// Recent paths as entries, newest first. Leaves out the page the user is on
// and anything they can no longer reach (it is not among the entries).
export const getRecentEntries = (
  paths: string[],
  entries: QuickSearchEntry[],
  currentPath: string | undefined
) => {
  const currentEntry = currentPath && matchEntry(currentPath, entries);
  const seen = new Set(currentEntry ? [entryKey(currentEntry)] : []);
  const recentEntries: QuickSearchEntry[] = [];

  for (const path of paths) {
    const entry = matchEntry(path, entries);
    if (entry && !seen.has(entryKey(entry))) {
      seen.add(entryKey(entry));
      recentEntries.push(entry);
    }
    if (recentEntries.length === MAX_SHOWN) break;
  }

  return recentEntries;
};
