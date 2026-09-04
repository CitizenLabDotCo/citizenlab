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
  default: () => <div data-testid="banner" />,
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
});
