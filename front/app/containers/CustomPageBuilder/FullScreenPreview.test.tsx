import React from 'react';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

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

jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockUseCustomPageLayout = useCustomPageLayout as jest.Mock;

describe('FullScreenPreview', () => {
  beforeEach(() => {
    mockUseCustomPageLayout.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    layoutProvider.mockClear();
  });

  // FileAttachment looks its file up via the layout's own attachments, so without this those
  // widgets render nothing in the preview while working in the builder and the front office.
  it('puts the layout id in context for widgets that need it', () => {
    mockUseCustomPageLayout.mockReturnValue({
      data: {
        data: {
          id: 'layout-1',
          attributes: { craftjs_json: { ROOT: { nodes: [] } } },
        },
      },
      isLoading: false,
    });

    render(<FullScreenPreview staticPageId="page-1" />);

    expect(layoutProvider).toHaveBeenCalledWith({ layoutId: 'layout-1' });
  });

  // A page with no layout 404s. Deriving the wait from `layout === undefined` left the
  // spinner up for good, because the query settles without ever producing data.
  it('renders nothing when the layout could not be loaded', () => {
    render(<FullScreenPreview staticPageId="page-1" />);

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
  });
});
