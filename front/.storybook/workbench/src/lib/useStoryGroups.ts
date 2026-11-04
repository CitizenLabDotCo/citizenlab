import { useEffect, useState } from 'react';

import { loadIndexFiles, loadScan, loadStoryIndex } from './data';
import { buildGroups, StoryGroup } from './stories';

// The story groups of the build, or null while index.json and the scan load.
// With `early`, the groups come from index.json alone first, every status
// 'pending', so the gallery's cards show without waiting for the scan
// (7 MB); then the same groups with the scan's office and routes, and each
// file's status from the code index (files.json). With `hold`, the scan
// waits (the component page lets its canvas load first).
export const useStoryGroups = ({ early = false, hold = false } = {}):
  | StoryGroup[]
  | null => {
  const [groups, setGroups] = useState<StoryGroup[] | null>(null);
  useEffect(() => {
    let live = true;
    let scanned = false;
    if (early) {
      loadStoryIndex().then((index) => {
        if (live && !scanned) setGroups(buildGroups(index, null));
      });
    }
    if (hold) {
      return () => {
        live = false;
      };
    }
    Promise.all([loadStoryIndex(), loadScan(), loadIndexFiles()]).then(
      ([index, scan, files]) => {
        scanned = true;
        if (live) setGroups(buildGroups(index, scan, files));
      }
    );
    return () => {
      live = false;
    };
  }, [early, hold]);
  return groups;
};
