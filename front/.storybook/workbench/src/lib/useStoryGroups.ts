import { useEffect, useState } from 'react';

import { loadScan, loadStoryIndex } from './data';
import { buildGroups, StoryGroup } from './stories';

// The story groups of the build, or null while index.json and the scan load.
// With `early`, the groups come from index.json alone first, every status
// 'pending', so the gallery's cards show without waiting for the scan
// (7 MB); then the same groups with the scan's status, score and office.
export const useStoryGroups = ({ early = false } = {}): StoryGroup[] | null => {
  const [groups, setGroups] = useState<StoryGroup[] | null>(null);
  useEffect(() => {
    let live = true;
    let scanned = false;
    if (early) {
      loadStoryIndex().then((index) => {
        if (live && !scanned) setGroups(buildGroups(index, null));
      });
    }
    Promise.all([loadStoryIndex(), loadScan()]).then(([index, scan]) => {
      scanned = true;
      if (live) setGroups(buildGroups(index, scan));
    });
    return () => {
      live = false;
    };
  }, [early]);
  return groups;
};
