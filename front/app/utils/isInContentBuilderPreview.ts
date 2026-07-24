// Content-builder editors (project page, project/folder description, homepage)
// render their live preview inside a same-origin <iframe> pointing at an
// `.../preview` admin route. That iframe boots a second copy of the whole app,
// which would re-run tenant analytics/consent scripts (e.g. Civic Cookie Control
// loaded via GTM). Re-running them inside the frame can wipe the shared auth
// cookie and sign the editor out, and re-prompts for cookie consent. Trackers
// use this to skip booting there. See TAN-8309.
const CONTENT_BUILDER_PREVIEW_SEGMENTS = [
  'project-page-builder',
  'description-builder',
  'homepage-builder',
];

export const isContentBuilderPreviewPath = (pathname: string): boolean =>
  pathname.endsWith('/preview') &&
  CONTENT_BUILDER_PREVIEW_SEGMENTS.some((segment) =>
    pathname.includes(`/${segment}`)
  );

const isFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    // Reading window.top can throw across origins; a throw means we're framed.
    return true;
  }
};

export const isInContentBuilderPreview = (): boolean =>
  isContentBuilderPreviewPath(window.location.pathname) && isFramed();

export default isInContentBuilderPreview;
