import React from 'react';

import { render, waitFor } from 'utils/testUtils/rtl';

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

let layoutIsError = false;
jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({ isError: layoutIsError })),
}));

describe('CustomPageBuilder bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    layoutIsError = false;
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
