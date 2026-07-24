import {
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
  // In jsdom the app runs as the top-level document (window.self === window.top),
  // i.e. not framed, so the guard is never active regardless of the path.
  it('returns false when not running inside an iframe', () => {
    expect(isInContentBuilderPreview()).toBe(false);
  });
});
