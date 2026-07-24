import {
  PREVIEW_FRAME_PARAM,
  isContentBuilderPreviewPath,
  isInContentBuilderPreview,
} from './isInContentBuilderPreview';

describe('isContentBuilderPreviewPath', () => {
  it('matches content-builder preview routes', () => {
    expect(
      isContentBuilderPreviewPath(
        '/en/admin/project-page-builder/projects/abc/preview'
      )
    ).toBe(true);
    expect(
      isContentBuilderPreviewPath(
        '/en/admin/description-builder/projects/abc/preview'
      )
    ).toBe(true);
    expect(
      isContentBuilderPreviewPath(
        '/en/admin/description-builder/folders/abc/preview'
      )
    ).toBe(true);
    expect(
      isContentBuilderPreviewPath(
        '/en/admin/pages-menu/homepage-builder/preview'
      )
    ).toBe(true);
  });

  it('does not match non-preview routes', () => {
    expect(
      isContentBuilderPreviewPath('/en/admin/projects/abc/project-page')
    ).toBe(false);
    expect(isContentBuilderPreviewPath('/en/projects/my-project')).toBe(false);
  });

  it('does not match preview routes of other builders', () => {
    expect(
      isContentBuilderPreviewPath(
        '/en/admin/reporting/report-builder/abc/preview'
      )
    ).toBe(false);
  });
});

describe('isInContentBuilderPreview', () => {
  const PREVIEW_PATH = '/en/admin/project-page-builder/projects/abc/preview';

  const originalSelf = window.self;
  const originalPathname = window.location.pathname;

  // `window.top` is unforgeable; `self` can be redefined, so pointing it
  // elsewhere is what makes `window.self !== window.top`.
  const setFramed = (framed: boolean) => {
    Object.defineProperty(window, 'self', {
      value: framed ? ({} as Window) : originalSelf,
      configurable: true,
      writable: true,
    });
  };

  // replaceState changes location.pathname without triggering a jsdom navigation.
  const setPathname = (pathname: string) =>
    window.history.replaceState({}, '', pathname);

  afterEach(() => {
    setFramed(false);
    setPathname(originalPathname);
  });

  it('returns true on a preview route inside an iframe', () => {
    setPathname(PREVIEW_PATH);
    setFramed(true);

    expect(isInContentBuilderPreview()).toBe(true);
  });

  it('returns false on a preview route that is not framed', () => {
    setPathname(PREVIEW_PATH);

    expect(isInContentBuilderPreview()).toBe(false);
  });

  it('returns false inside an iframe on a route that is not a preview', () => {
    setPathname('/en/admin/projects/abc/settings');
    setFramed(true);

    expect(isInContentBuilderPreview()).toBe(false);
  });

  it('returns true inside the project page front-office preview iframe', () => {
    setPathname(`/en/projects/my-project?${PREVIEW_FRAME_PARAM}=true`);
    setFramed(true);

    expect(isInContentBuilderPreview()).toBe(true);
  });

  it('returns false on a marked preview URL that is not framed', () => {
    setPathname(`/en/projects/my-project?${PREVIEW_FRAME_PARAM}=true`);

    expect(isInContentBuilderPreview()).toBe(false);
  });

  it('preserves other query params alongside the marker', () => {
    setPathname(`/en/projects/my-project?foo=bar&${PREVIEW_FRAME_PARAM}=true`);
    setFramed(true);

    expect(isInContentBuilderPreview()).toBe(true);
  });
});
