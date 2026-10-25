import { useEffect, useState } from 'react';

import { loadThumbs } from './data';

import type { ThumbManifest } from './thumbs';

// The build's thumbnail pictures: undefined while thumbs.json loads, null
// when the build has none.
export const useThumbs = (): ThumbManifest | null | undefined => {
  const [manifest, setManifest] = useState<ThumbManifest | null | undefined>(
    undefined
  );
  useEffect(() => {
    let live = true;
    loadThumbs().then((m) => {
      if (live) setManifest(m);
    });
    return () => {
      live = false;
    };
  }, []);
  return manifest;
};
