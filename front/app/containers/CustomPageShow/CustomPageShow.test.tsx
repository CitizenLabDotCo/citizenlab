import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomPageShow from '.';

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ slug: 'about-us' }),
}));

jest.mock('components/CustomPageBuilder/ContentViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="builderContent" />,
}));
jest.mock('components/LandingPages/citizen/InfoSection', () => ({
  __esModule: true,
  default: () => <div data-testid="legacyInfoSection" />,
}));
jest.mock('./CustomPageProjectsAndEvents', () => ({
  __esModule: true,
  default: () => <div data-testid="legacyProjects" />,
}));
jest.mock('./CustomPageHeader', () => ({
  __esModule: true,
  default: ({ showAdminEditButton }: { showAdminEditButton?: boolean }) => (
    <div data-testid="banner" data-edit-button={String(showAdminEditButton)} />
  ),
}));
jest.mock('./CustomPageHeader/AdminCustomPageEditButton', () => ({
  __esModule: true,
  default: () => <div data-testid="editButton" />,
}));

jest.mock('api/app_configuration/useAppConfiguration', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          settings: { core: { organization_name: { en: 'Test org' } } },
        },
      },
    },
  }))
);
jest.mock('api/page_files/usePageFiles', () => jest.fn(() => ({ data: null })));

const globalCustomPage = {
  code: 'custom',
  project_id: null,
  title_multiloc: { en: 'About us' },
  banner_enabled: false,
  top_info_section_enabled: true,
  top_info_section_multiloc: { en: '<p>Top</p>' },
  bottom_info_section_enabled: true,
  bottom_info_section_multiloc: { en: '<p>Bottom</p>' },
  files_section_enabled: false,
  projects_filter_type: 'no_filter',
};

let pageAttributes: Record<string, unknown> = globalCustomPage;
jest.mock('api/custom_pages/useCustomPageBySlug', () =>
  jest.fn(() => ({
    data: { data: { id: 'page-1', attributes: pageAttributes } },
    isError: false,
  }))
);

let hasContent = false;
let isLoading = false;
jest.mock(
  'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent',
  () => ({
    __esModule: true,
    // Mirrors the real hook, which is disabled without an id and so reports nothing.
    default: jest.fn((staticPageId?: string) =>
      staticPageId
        ? { hasContent, isLoading }
        : { hasContent: false, isLoading: false }
    ),
  })
);

describe('CustomPageShow', () => {
  beforeEach(() => {
    hasContent = false;
    isLoading = false;
    pageAttributes = globalCustomPage;
  });

  it('renders the legacy sections when the builder has no content', () => {
    hasContent = false;
    render(<CustomPageShow />);

    expect(screen.getAllByTestId('legacyInfoSection')).toHaveLength(2);
    expect(screen.getByTestId('legacyProjects')).toBeInTheDocument();
    expect(screen.queryByTestId('builderContent')).not.toBeInTheDocument();
  });

  it('renders the builder content instead of the legacy sections', () => {
    hasContent = true;
    render(<CustomPageShow />);

    expect(screen.getByTestId('builderContent')).toBeInTheDocument();
    expect(screen.queryByTestId('legacyInfoSection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacyProjects')).not.toBeInTheDocument();
  });

  // The layout carries a Title widget that owns the heading and can hide it, so rendering
  // the legacy one too showed the title twice.
  it('leaves the heading to the builder content', () => {
    hasContent = true;
    render(<CustomPageShow />);

    expect(
      screen.queryByRole('heading', { name: 'About us' })
    ).not.toBeInTheDocument();
  });

  it('still renders the heading on a page with no builder content', () => {
    hasContent = false;
    render(<CustomPageShow />);

    expect(
      screen.getByRole('heading', { name: 'About us' })
    ).toBeInTheDocument();
  });

  // Rendering them first would show content that is replaced as soon as the layout arrives.
  it('does not render the legacy sections while the layout is still loading', () => {
    isLoading = true;
    render(<CustomPageShow />);

    expect(screen.queryByTestId('legacyInfoSection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacyProjects')).not.toBeInTheDocument();
    expect(screen.getByTestId('builderContent')).toBeInTheDocument();
  });

  // Policy and project-scoped pages are not on the Content Builder.
  it.each([
    ['a policy page', { code: 'faq' }],
    ['a project-scoped page', { project_id: 'project-1' }],
  ])('renders the legacy sections for %s', (_label, overrides) => {
    hasContent = true;
    pageAttributes = { ...globalCustomPage, ...overrides };
    render(<CustomPageShow />);

    expect(screen.getAllByTestId('legacyInfoSection')).toHaveLength(2);
    expect(screen.queryByTestId('builderContent')).not.toBeInTheDocument();
  });

  // A page may have no banner and a hidden title, so the button belongs to the page rather
  // than to any widget that might not be there.
  describe('the admin edit button', () => {
    it('renders once for the page when builder content renders', () => {
      hasContent = true;
      render(<CustomPageShow />);

      expect(screen.getAllByTestId('editButton')).toHaveLength(1);
    });

    it('renders once on a legacy page too', () => {
      hasContent = false;
      render(<CustomPageShow />);

      expect(screen.getAllByTestId('editButton')).toHaveLength(1);
    });

    // Otherwise a banner page shows two: the layout's and the page's.
    it('is suppressed inside the banner when builder content renders', () => {
      hasContent = true;
      pageAttributes = { ...globalCustomPage, banner_enabled: true };
      render(<CustomPageShow />);

      expect(screen.getByTestId('banner')).toHaveAttribute(
        'data-edit-button',
        'false'
      );
      expect(screen.getAllByTestId('editButton')).toHaveLength(1);
    });

    it('is left to the banner on a legacy page', () => {
      hasContent = false;
      pageAttributes = { ...globalCustomPage, banner_enabled: true };
      render(<CustomPageShow />);

      expect(screen.getByTestId('banner')).toHaveAttribute(
        'data-edit-button',
        'true'
      );
      expect(screen.queryByTestId('editButton')).not.toBeInTheDocument();
    });
  });
});
