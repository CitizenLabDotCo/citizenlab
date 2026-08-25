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

// The scaffold a page gets before anyone authors anything in the builder.
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

  it('renders the layout when the feature is on and it has content', () => {
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('customPageContentViewer')).toBeInTheDocument();
    expect(screen.getByTestId('frame')).toBeInTheDocument();
  });

  // CustomPageShow hands the page over while the query is in flight, so the wait is shown
  // here rather than behind the legacy sections.
  it('shows a spinner while the layout is loading', () => {
    isLoading = true;
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
  });

  // The page renders its legacy sections instead whenever this returns null.
  it('renders nothing when the feature is off', () => {
    featureEnabled = false;
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });

  it('renders nothing when the layout is disabled', () => {
    layoutResponse = layout(false, withContent);
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });

  // The common case: most pages have no layout until an admin opens the builder.
  it('renders nothing when there is no layout', () => {
    layoutResponse = null;
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

  // Every page gets a scaffold as soon as it has a layout, so treating one as content would
  // replace the page's legacy sections with a blank body.
  it('renders nothing when the layout holds only the scaffold', () => {
    layoutResponse = layout(true, scaffoldOnly);
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });
});
