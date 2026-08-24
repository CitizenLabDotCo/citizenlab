import React from 'react';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import CustomPageBuilder from '.';

jest.mock('./CustomPageBuilderPage', () => ({
  __esModule: true,
  default: () => <div data-testid="builderPage" />,
}));

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
        attributes: { slug: 'about-us', title_multiloc: { en: 'About' } },
      },
    },
  })),
}));

const mockUpsert = jest.fn();
jest.mock('api/custom_page_layout/useUpsertCustomPageLayout', () =>
  jest.fn(() => ({ mutate: mockUpsert }))
);

let featureEnabled = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => featureEnabled));

let layoutIsError = false;
jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({ isError: layoutIsError })),
}));

describe('CustomPageBuilder bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    layoutIsError = false;
    featureEnabled = true;
  });

  it('does not create a layout when one already exists', () => {
    render(<CustomPageBuilder />);

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  // A page with no layout 404s. The builder creates one so it opens on the page's own
  // info sections rather than a blank canvas.
  it('creates a layout when the page has none', async () => {
    layoutIsError = true;
    render(<CustomPageBuilder />);

    await waitFor(() => expect(mockUpsert).toHaveBeenCalled());
    expect(mockUpsert).toHaveBeenCalledWith({
      staticPageId: 'page-1',
      enabled: true,
    });
  });

  // Gating only the link would let an admin reach the builder by typing the URL — and
  // opening it provisions a layout, so the gate has to sit ahead of the bootstrap.
  it('renders nothing and writes no layout when the feature is off', () => {
    featureEnabled = false;
    layoutIsError = true;
    render(<CustomPageBuilder />);

    expect(screen.queryByTestId('builderPage')).not.toBeInTheDocument();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  // Without the ref guard this re-fires on every render, hammering the endpoint.
  it('creates the layout only once across re-renders', async () => {
    layoutIsError = true;
    const { rerender } = render(<CustomPageBuilder />);

    await waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
    rerender(<CustomPageBuilder />);
    rerender(<CustomPageBuilder />);

    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });
});
