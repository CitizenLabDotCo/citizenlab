/**
 * Detects our prerender servers (see cl2-deployment/prerender), which serve
 * crawlers a server-rendered snapshot of the page.
 *
 * The prerenderer runs headless Chromium on GPU-less boxes with no WebGL2, so
 * anything requiring it (ArcGIS maps) throws there instead of rendering. Skip
 * that work rather than let it fail: prerender strips all script tags from its
 * output, so a canvas never reaches a crawler regardless.
 *
 * Deliberately dependency-free so it can be imported above a React.lazy
 * boundary without pulling the lazy chunk's dependencies into the main bundle.
 */
export const isPrerender = () =>
  typeof navigator !== 'undefined' && /Prerender/i.test(navigator.userAgent);
