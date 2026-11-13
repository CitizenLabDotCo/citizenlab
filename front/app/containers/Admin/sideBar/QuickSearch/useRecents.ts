import { useEffect, useMemo, useState } from 'react';

import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { useLocation } from 'utils/router';

import { QuickSearchEntry } from './filterEntries';
import {
  addRecentKey,
  entryKey,
  matchEntry,
  readRecentKeys,
  writeRecentKeys,
} from './recents';

// Records the places the user visits in local storage, as the keys of the
// entries they match, and returns them (newest first) with the current key.
// Only places search can show are kept, and all sub-pages of a place (e.g. a
// phase's setup and ideas pages) count as that one place.
const useRecents = (userId: string, entries: QuickSearchEntry[]) => {
  const location = useLocation();
  const { pathname } = removeLocale(location.pathname);
  const [recentKeys, setRecentKeys] = useState(() => readRecentKeys(userId));

  const currentEntry = useMemo(
    () => (pathname ? matchEntry(pathname, entries) : undefined),
    [pathname, entries]
  );
  const currentKey = currentEntry && entryKey(currentEntry);

  // Keyed on the entry rather than the path, so moving between sub-pages of
  // the same place doesn't write again. Projects and phases load later than
  // pages, so a project page is recorded once they are in.
  useEffect(() => {
    if (!currentKey) return;

    const keys = addRecentKey(readRecentKeys(userId), currentKey);
    writeRecentKeys(userId, keys);
    setRecentKeys(keys);
  }, [userId, currentKey]);

  return { recentKeys, currentKey };
};

export default useRecents;
