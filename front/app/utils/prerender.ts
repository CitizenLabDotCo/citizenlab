/**
 * Detects our prerender servers (cl2-deployment/prerender). Their headless
 * Chromium has no WebGL2, so ArcGIS maps throw there — and prerender strips
 * script tags anyway, so a canvas would never reach a crawler.
 *
 * Dependency-free so it can be imported above a React.lazy boundary.
 */
export const isPrerender = () =>
  typeof navigator !== 'undefined' && /Prerender/i.test(navigator.userAgent);
