import { navigateToUrl, reloadPage } from 'utils/urlUtils';

import type { AnyRouter } from '@tanstack/react-router';

// After a deploy, open tabs request chunks that no longer exist. A full page
// load fixes that, but only on a route change so unsaved input isn't lost.

// A chunk failing this soon after a route change belongs to the new route.
const ROUTE_CHANGE_WINDOW_MS = 10_000;

let lastRouteChangeAt: number | undefined;
let staleBuild = false;
let reloading = false;

// Errors from the old build during the reload are noise.
export const isReloadingForNewBuild = () => reloading;

// Once per chunk per session, so a truly missing chunk can't loop.
const reloadOnce = (chunkError: string) => {
  const key = `staleBuildReload:${chunkError}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    return;
  }
  reloading = true;
  reloadPage();
};

export const installStaleBuildReload = (router: AnyRouter) => {
  router.subscribe('onBeforeNavigate', ({ toLocation, pathChanged }) => {
    // Search and hash updates happen mid-form, so they don't count.
    if (!pathChanged) return;
    lastRouteChangeAt = Date.now();
    if (staleBuild) {
      reloading = true;
      navigateToUrl(toLocation.href);
    }
  });

  window.addEventListener('vite:preloadError', (event) => {
    staleBuild = true;
    if (
      lastRouteChangeAt !== undefined &&
      Date.now() - lastRouteChangeAt < ROUTE_CHANGE_WINDOW_MS
    ) {
      reloadOnce(String(event.payload));
    }
  });
};
