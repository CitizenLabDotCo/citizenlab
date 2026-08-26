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

const layoutProvider = jest.fn();
jest.mock(
  'components/admin/ContentBuilder/context/ContentBuilderLayoutContext',
  () => ({
    ContentBuilderLayoutProvider: ({
      layoutId,
      children,
    }: {
      layoutId?: string;
      children: React.ReactNode;
    }) => {
      layoutProvider({ layoutId });
      return <>{children}</>;
    },
  })
);

const layout = (enabled: boolean, craftjs_json: object) => ({
  data: { data: { id: 'layout-1', attributes: { enabled, craftjs_json } } },
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

  it('renders the layout when the feature is on and it has content', () => {
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('customPageContentViewer')).toBeInTheDocument();
    expect(screen.getByTestId('frame')).toBeInTheDocument();
  });

  // CustomPageShow hands over while the query is in flight, so the wait is shown here.
  it('shows a spinner while the layout is loading', () => {
    isLoading = true;
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
  });

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

  // Treating a scaffold as content would replace the page's own sections with a blank body.
  it('renders nothing when the layout holds only the scaffold', () => {
    layoutResponse = layout(true, scaffoldOnly);
    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(
      screen.queryByTestId('customPageContentViewer')
    ).not.toBeInTheDocument();
  });

  // FileAttachment looks its file up via the layout's own attachments, so without this the
  // widget renders nothing in the front office while working fine in the builder.
  it('puts the layout id in context for widgets that need it', () => {
    layoutResponse = layout(true, withContent);

    render(<CustomPageContentViewer staticPageId="page-1" />);

    expect(layoutProvider).toHaveBeenCalledWith({ layoutId: 'layout-1' });
  });
});
