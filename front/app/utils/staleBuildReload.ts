import { reloadPage } from 'utils/urlUtils';

import type { AnyRouter } from '@tanstack/react-router';

// After a deploy, open tabs request chunks that no longer exist. A full page
// load fixes that, but only on a route change so unsaved input isn't lost.

// A chunk failing this soon after a route change belongs to the new route.
const ROUTE_CHANGE_WINDOW_MS = 10_000;
const RELOAD_CANCELLED_AFTER_MS = 5_000;

let lastRouteChangeAt: number | undefined;
let staleBuild = false;
let reloading = false;
let reloadingTimer: ReturnType<typeof setTimeout> | undefined;

// Errors from the old build during the reload are noise.
export const isReloadingForNewBuild = () => reloading;

// If the unload is cancelled (e.g. "Stay" on a beforeunload prompt), the page
// lives on, so stop dropping its errors.
const markReloading = () => {
  reloading = true;
  clearTimeout(reloadingTimer);
  reloadingTimer = setTimeout(() => {
    reloading = false;
  }, RELOAD_CANCELLED_AFTER_MS);
};

// Each chunk gets one reload per session. A chunk that fails again after it
// is blocked or broken, not from an old build, and reloading can't fix it.
const isFirstFailure = (chunkError: string) => {
  const key = `staleBuildReload:${chunkError}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
};

export const installStaleBuildReload = (router: AnyRouter) => {
  router.subscribe('onBeforeNavigate', ({ pathChanged }) => {
    // Search and hash updates happen mid-form, so they don't count.
    if (!pathChanged) return;
    lastRouteChangeAt = Date.now();
    if (staleBuild) {
      markReloading();
      // The router writes the new URL to history in a microtask. Reloading
      // after that loads the new route without adding a duplicate entry.
      setTimeout(reloadPage, 0);
    }
  });

  window.addEventListener('vite:preloadError', (event) => {
    // Offline, a reload would only show the browser's offline page.
    if (reloading || !navigator.onLine) return;
    if (!isFirstFailure(String(event.payload))) return;

    staleBuild = true;
    if (
      lastRouteChangeAt !== undefined &&
      Date.now() - lastRouteChangeAt < ROUTE_CHANGE_WINDOW_MS
    ) {
      markReloading();
      reloadPage();
    }
  });
};
