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

let layoutResponse:
  | { data: { attributes: { craftjs_json: object } } }
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
      data: { attributes: { craftjs_json: { ROOT: { nodes: [] } } } },
    };
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
