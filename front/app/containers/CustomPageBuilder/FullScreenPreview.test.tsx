import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import FullScreenPreview from './FullScreenPreview';

jest.mock('components/CustomPageBuilder/Editor', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('components/admin/ContentBuilder/Frame', () => ({
  __esModule: true,
  default: () => <div data-testid="frame" />,
}));
jest.mock('components/admin/ContentBuilder/FullscreenPreview/Wrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('components/admin/ContentBuilder/LanguageProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

let layoutResponse:
  | { data: { id?: string; attributes: { craftjs_json: object } } }
  | undefined;
let isLoading = false;
jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: layoutResponse, isLoading })),
}));

describe('FullScreenPreview', () => {
  beforeEach(() => {
    isLoading = false;
    layoutResponse = {
      data: {
        id: 'layout-1',
        attributes: { craftjs_json: { ROOT: { nodes: [] } } },
      },
    };
    layoutProvider.mockClear();
  });

  // FileAttachment looks its file up via the layout's own attachments, so without this those
  // widgets render nothing in the preview while working in the builder and the front office.
  it('puts the layout id in context for widgets that need it', () => {
    render(<FullScreenPreview staticPageId="page-1" />);

    expect(layoutProvider).toHaveBeenCalledWith({ layoutId: 'layout-1' });
  });

  it('renders the stored layout', () => {
    render(<FullScreenPreview staticPageId="page-1" />);

    expect(screen.getByTestId('frame')).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('shows a spinner while the layout is loading', () => {
    isLoading = true;
    layoutResponse = undefined;
    render(<FullScreenPreview staticPageId="page-1" />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  // A page with no layout 404s. Deriving the wait from `layout === undefined` left the
  // spinner up for good, because the query settles without ever producing data.
  it('renders nothing when the layout could not be loaded', () => {
    layoutResponse = undefined;
    render(<FullScreenPreview staticPageId="page-1" />);

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
  });
});
