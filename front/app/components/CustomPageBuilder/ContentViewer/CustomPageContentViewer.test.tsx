import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomPageContentViewer from '.';

jest.mock('components/CustomPageBuilder/Editor', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('components/admin/ContentBuilder/Frame', () => ({
  __esModule: true,
  default: () => <div data-testid="frame" />,
}));

let featureEnabled = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => featureEnabled));

let layoutResponse: {
  data: { data: { attributes: { enabled: boolean; craftjs_json: object } } };
} | null = null;
let isLoading = false;
jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: layoutResponse?.data, isLoading })),
}));

const layout = (enabled: boolean, craftjs_json: object) => ({
  data: { data: { attributes: { enabled, craftjs_json } } },
});

// What a page holds before anyone authors anything in the builder.
const scaffoldOnly = {
  ROOT: {
    type: { resolvedName: 'CustomPageRoot' },
    nodes: ['CUSTOM_PAGE_BODY'],
  },
  CUSTOM_PAGE_BODY: { type: { resolvedName: 'CustomPageBody' }, nodes: [] },
};

const withContent = {
  ...scaffoldOnly,
  CUSTOM_PAGE_BODY: {
    type: { resolvedName: 'CustomPageBody' },
    nodes: ['TXT'],
  },
  TXT: { type: { resolvedName: 'TextMultiloc' }, nodes: [] },
};

describe('CustomPageContentViewer', () => {
  beforeEach(() => {
    featureEnabled = true;
    isLoading = false;
    layoutResponse = layout(true, withContent);
  });

  // CustomPageShow hands over while the query is in flight, so the wait is shown here.
  it('shows a spinner while the layout is loading', () => {
    isLoading = true;
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
  });

  it('renders nothing when the layout is disabled', () => {
    layoutResponse = layout(false, withContent);
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });

  it('renders nothing when the layout is empty', () => {
    layoutResponse = layout(true, {});
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });

  // Treating a scaffold as content would replace the page's own sections with a blank body.
  it('renders nothing when the layout holds only the scaffold', () => {
    layoutResponse = layout(true, scaffoldOnly);
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });
});
