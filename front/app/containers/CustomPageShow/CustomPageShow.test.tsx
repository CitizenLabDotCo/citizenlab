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

jest.mock('api/custom_pages/useCustomPageBySlug', () =>
  jest.fn(() => ({
    data: {
      data: {
        id: 'page-1',
        attributes: {
          title_multiloc: { en: 'About us' },
          banner_enabled: false,
          top_info_section_enabled: true,
          top_info_section_multiloc: { en: '<p>Top</p>' },
          bottom_info_section_enabled: true,
          bottom_info_section_multiloc: { en: '<p>Bottom</p>' },
          files_section_enabled: false,
          projects_filter_type: 'no_filter',
        },
      },
    },
    isError: false,
  }))
);

let hasContent = false;
let isLoading = false;
jest.mock(
  'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({ hasContent, isLoading })),
  })
);

describe('CustomPageShow', () => {
  beforeEach(() => {
    hasContent = false;
    isLoading = false;
  });

  it('renders the legacy sections when the builder has no content', () => {
    hasContent = false;
    render(<CustomPageShow />);

    expect(screen.getAllByTestId('legacyInfoSection')).toHaveLength(2);
    expect(screen.getByTestId('legacyProjects')).toBeInTheDocument();
    expect(screen.queryByTestId('builderContent')).not.toBeInTheDocument();
  });

  // The builder replaces the legacy sections rather than rendering alongside them.
  it('renders the builder content instead of the legacy sections', () => {
    hasContent = true;
    render(<CustomPageShow />);

    expect(screen.getByTestId('builderContent')).toBeInTheDocument();
    expect(screen.queryByTestId('legacyInfoSection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacyProjects')).not.toBeInTheDocument();
  });

  // Rendering the legacy sections first would show content that is replaced as soon as the
  // layout arrives.
  it('does not render the legacy sections while the layout is still loading', () => {
    isLoading = true;
    render(<CustomPageShow />);

    expect(screen.queryByTestId('legacyInfoSection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacyProjects')).not.toBeInTheDocument();
    expect(screen.getByTestId('builderContent')).toBeInTheDocument();
  });
});
