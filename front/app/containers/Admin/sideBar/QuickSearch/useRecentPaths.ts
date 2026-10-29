import { useEffect, useState } from 'react';

import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { useLocation } from 'utils/router';

import {
  addRecentPath,
  readRecentPaths,
  writeRecentPaths,
} from './recentPaths';

// Records every admin page the user visits in local storage, and returns the
// visited paths (newest first) with the current path.
const useRecentPaths = (userId: string) => {
  const location = useLocation();
  const { pathname: currentPath } = removeLocale(location.pathname);
  const [recentPaths, setRecentPaths] = useState(() => readRecentPaths(userId));

  useEffect(() => {
    if (!currentPath?.startsWith('/admin')) return;

    const paths = addRecentPath(readRecentPaths(userId), currentPath);
    writeRecentPaths(userId, paths);
    setRecentPaths(paths);
  }, [userId, currentPath]);

  return { recentPaths, currentPath };
};

export default useRecentPaths;
