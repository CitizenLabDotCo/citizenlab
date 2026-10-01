import React from 'react';

import { ICustomPageData, ProjectsFilterTypes } from 'api/custom_pages/types';

import { screen, render } from 'utils/testUtils/rtl';

import CustomPagesEditContent from './';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));
jest.mock('api/custom_pages/useUpdateCustomPage', () =>
  jest.fn(() => ({ mutate: jest.fn() }))
);

const buildCustomPage = (
  projects_filter_type: ProjectsFilterTypes
): ICustomPageData => ({
  id: 'customPageId',
  type: 'static_page',
  attributes: {
    top_info_section_multiloc: {},
    title_multiloc: { en: 'title' },
    nav_bar_item_title_multiloc: { en: 'title' },
    slug: 'my-custom-page',
    banner_layout: 'fixed_ratio_layout',
    banner_overlay_color: '#fff',
    banner_overlay_opacity: 80,
    banner_cta_button_multiloc: {},
    banner_cta_button_type: 'no_button',
    banner_cta_button_url: null,
    banner_header_multiloc: {},
    banner_subheader_multiloc: {},
    bottom_info_section_multiloc: {},
    header_bg: null,
    code: 'custom',
    projects_filter_type,
    created_at: 'date',
    updated_at: 'date',
    banner_enabled: true,
    bottom_info_section_enabled: true,
    top_info_section_enabled: true,
    events_widget_enabled: true,
    files_section_enabled: true,
    projects_enabled: true,
  },
  relationships: {
    nav_bar_item: { data: { id: '123', type: 'nav_bar_item' } },
    global_topics: { data: [] },
    areas: { data: [] },
    spaces: { data: [] },
  },
});

let mockCustomPage: ICustomPageData = buildCustomPage('areas');
jest.mock('api/custom_pages/useCustomPageById', () =>
  jest.fn(() => ({ data: { data: mockCustomPage } }))
);

describe('CustomPagesEditContent', () => {
  it('labels the section "Projects list" when filtering by areas', () => {
    mockCustomPage = buildCustomPage('areas');
    render(<CustomPagesEditContent />);

    expect(screen.getByText('Projects list')).toBeInTheDocument();
    expect(
      screen.queryByText('Projects and folders list')
    ).not.toBeInTheDocument();
  });

  it('labels the section "Projects list" when filtering by tags', () => {
    mockCustomPage = buildCustomPage('global_topics');
    render(<CustomPagesEditContent />);

    expect(screen.getByText('Projects list')).toBeInTheDocument();
    expect(
      screen.queryByText('Projects and folders list')
    ).not.toBeInTheDocument();
  });

  it('labels the section "Projects and folders list" when filtering by spaces', () => {
    mockCustomPage = buildCustomPage('spaces');
    render(<CustomPagesEditContent />);

    expect(screen.getByText('Projects and folders list')).toBeInTheDocument();
    expect(screen.queryByText('Projects list')).not.toBeInTheDocument();
  });
});
