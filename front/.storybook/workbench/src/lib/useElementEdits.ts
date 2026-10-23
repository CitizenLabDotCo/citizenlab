import { useCallback, useEffect, useState } from 'react';

import type { TokenMeta } from './data';
import { ElementEdit, parseStored, STORAGE_KEY } from './elementEdits';

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch {
      // Not kept; the session still has them.
    }
  }, [edits]);
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
