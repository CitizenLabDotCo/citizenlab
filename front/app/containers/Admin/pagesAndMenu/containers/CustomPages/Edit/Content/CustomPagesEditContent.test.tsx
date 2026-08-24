import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomPagesEditContent from '.';

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ customPageId: 'page-1' }),
}));

jest.mock('api/custom_pages/useCustomPageById', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      data: {
        id: 'page-1',
        attributes: {
          banner_enabled: false,
          top_info_section_enabled: false,
          files_section_enabled: false,
          projects_enabled: false,
          events_widget_enabled: false,
          bottom_info_section_enabled: false,
          projects_filter_type: 'no_filter',
        },
      },
    },
  })),
}));

jest.mock('api/custom_pages/useUpdateCustomPage', () =>
  jest.fn(() => ({ mutate: jest.fn() }))
);

let enabledFlags: string[] = [];
jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => enabledFlags.includes(name))
);

const LINK_TEXT = 'Edit this page in the content builder';

describe('CustomPagesEditContent content builder link', () => {
  beforeEach(() => {
    enabledFlags = [];
  });

  it('hides the link when custom_page_builder is off', () => {
    render(<CustomPagesEditContent />);

    expect(screen.queryByText(LINK_TEXT)).not.toBeInTheDocument();
  });

  it('shows the link when custom_page_builder is on', () => {
    enabledFlags = ['custom_page_builder'];
    render(<CustomPagesEditContent />);

    expect(screen.getByText(LINK_TEXT)).toBeInTheDocument();
  });
});
