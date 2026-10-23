import { useEffect, useState } from 'react';

import { loadA11y } from './data';

import type { A11yResults } from './a11y';

// a11y-results.json, or null while it loads or when the build has none.
export const useA11yResults = (): {
  results: A11yResults | null;
  loaded: boolean;
} => {
  const [state, setState] = useState<{
    results: A11yResults | null;
    loaded: boolean;
  }>({ results: null, loaded: false });
  useEffect(() => {
    let live = true;
    loadA11y().then((r) => {
      if (live) setState({ results: r, loaded: true });
    });
    return () => {
      live = false;
    };
  }, []);
  return state;
};
