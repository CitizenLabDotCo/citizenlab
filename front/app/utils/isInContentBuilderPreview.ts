// Admin editors render a live preview inside a same-origin <iframe> that boots a
// second copy of the whole app. Re-running tenant analytics there re-runs whatever
// those tags load — for one tenant, GTM loads a nested container that injects Civic
// Cookie Control, whose cookie purge deletes the shared `cl2_jwt` and signs the
// editor out. Trackers use this to skip booting inside such frames. See TAN-8309.
//
// Two kinds of preview frame exist:
//   - content-builder editors (project page, project/folder description, homepage),
//     which frame an `.../preview` admin route;
//   - the project edit page, which frames the real front-office project page and so
//     has no distinguishing path — it carries PREVIEW_FRAME_PARAM instead.
const CONTENT_BUILDER_PREVIEW_SEGMENTS = [
  'project-page-builder',
  'description-builder',
  'homepage-builder',
];

/** Marks an iframe src as an in-app preview. Set by whoever renders the frame. */
export const PREVIEW_FRAME_PARAM = 'preview_frame';

export const isContentBuilderPreviewPath = (pathname: string): boolean =>
  pathname.endsWith('/preview') &&
  CONTENT_BUILDER_PREVIEW_SEGMENTS.some((segment) =>
    pathname.includes(`/${segment}`)
  );

export const hasPreviewFrameParam = (search: string): boolean =>
  new URLSearchParams(search).get(PREVIEW_FRAME_PARAM) === 'true';

const isFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    // Reading window.top can throw across origins; a throw means we're framed.
    return true;
  }
};

// Framing is required as well as the path/param: opening either URL directly in a
// tab is an ordinary page view that should still be tracked.
export const isInContentBuilderPreview = (): boolean =>
  (isContentBuilderPreviewPath(window.location.pathname) ||
    hasPreviewFrameParam(window.location.search)) &&
  isFramed();
