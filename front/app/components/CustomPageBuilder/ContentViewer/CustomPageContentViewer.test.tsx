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

describe('CustomPageContentViewer', () => {
  beforeEach(() => {
    featureEnabled = true;
    isLoading = false;
    layoutResponse = layout(true, { ROOT: { nodes: [] } });
  });

  it('renders the layout when the feature is on and it has content', () => {
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('customPageContentViewer')).toBeInTheDocument();
    expect(screen.getByTestId('frame')).toBeInTheDocument();
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
    layoutResponse = layout(false, { ROOT: { nodes: [] } });
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
});
