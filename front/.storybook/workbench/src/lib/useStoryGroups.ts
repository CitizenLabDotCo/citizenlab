import { useEffect, useState } from 'react';

import { loadScan, loadStoryIndex } from './data';
import { buildGroups, StoryGroup } from './stories';

// The story groups of the build, or null while index.json and the scan load.
export const useStoryGroups = (): StoryGroup[] | null => {
  const [groups, setGroups] = useState<StoryGroup[] | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all([loadStoryIndex(), loadScan()]).then(([index, scan]) => {
      if (live) setGroups(buildGroups(index, scan));
    });
    return () => {
      live = false;
    };
  }, []);
  return groups;
};
