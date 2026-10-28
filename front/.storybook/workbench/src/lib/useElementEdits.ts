import { useCallback, useEffect, useState } from 'react';

import type { TokenMeta } from './data';
import { ElementEdit, parseStored, STORAGE_KEY } from './elementEdits';

// Said on window when one view changes the edits, so the others (the
// component page, the Review page, the nav count) read them again.
const CHANGED = 'gv-element-edits-changed';

const read = (meta: TokenMeta[]) => {
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY), meta);
  } catch {
    return [];
  }
};

// The session's element edits, newest last, kept per browser.
export const useElementEdits = (meta: TokenMeta[]) => {
  const [edits, setEdits] = useState<ElementEdit[]>(() => read(meta));
  useEffect(() => {
    try {
      const text = JSON.stringify(edits);
      if (window.localStorage.getItem(STORAGE_KEY) === text) return;
      window.localStorage.setItem(STORAGE_KEY, text);
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      // Not kept; the session still has them.
    }
  }, [edits]);
  useEffect(() => {
    const sync = () =>
      setEdits((now) => {
        const next = read(meta);
        return JSON.stringify(next) === JSON.stringify(now) ? now : next;
      });
    window.addEventListener(CHANGED, sync);
    // Another tab.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', sync);
    };
  }, [meta]);
  const add = useCallback(
    (e: ElementEdit) =>
      setEdits((all) => [...all.filter((x) => x.id !== e.id), e]),
    []
  );
  const remove = useCallback(
    (id: string) => setEdits((all) => all.filter((x) => x.id !== id)),
    []
  );
  const clear = useCallback(() => setEdits([]), []);
  return { edits, add, remove, clear };
};
