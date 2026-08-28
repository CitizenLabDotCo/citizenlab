import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomPageBanner from '.';

const withBanner = {
  data: {
    id: 'page-1',
    attributes: {
      banner_layout: 'full_width_banner_layout',
      banner_header_multiloc: { en: 'Welcome' },
      banner_subheader_multiloc: {},
      header_bg: { large: 'https://example.com/a.png' },
    },
  },
};

let page: unknown = withBanner;
jest.mock('api/custom_pages/useCustomPageById', () => ({
  __esModule: true,
  default: () => ({ data: page }),
}));
jest.mock('../useWidgetCustomPageId', () => ({
  __esModule: true,
  default: () => 'page-1',
}));

let mockInBuilder = true;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => object) =>
    collect({ options: { enabled: mockInBuilder } }),
}));

// The real header is covered by its own tests; here we only care whether it renders.
jest.mock('components/CustomPageHeader', () => ({
  __esModule: true,
  default: ({ pageData }: { pageData: { id: string } }) => (
    <div data-testid="header" data-page={pageData.id} />
  ),
}));

describe('CustomPageBanner', () => {
  beforeEach(() => {
    mockInBuilder = true;
    page = withBanner;
  });

  it('renders the page banner from the record', () => {
    render(<CustomPageBanner />);

    expect(screen.getByTestId('header')).toHaveAttribute('data-page', 'page-1');
  });

  // The layouts would render a bare coloured block, which reads as broken rather than
  // as something waiting to be filled in.
  it('explains itself in the builder when nothing is configured', () => {
    page = {
      data: {
        id: 'page-1',
        attributes: { banner_header_multiloc: {}, header_bg: null },
      },
    };

    render(<CustomPageBanner />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByText(/Add an image and a heading/)).toBeInTheDocument();
  });

  it('renders nothing when unconfigured in the front office', () => {
    mockInBuilder = false;
    page = {
      data: {
        id: 'page-1',
        attributes: { banner_header_multiloc: {}, header_bg: null },
      },
    };

    render(<CustomPageBanner />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByText(/Add an image/)).not.toBeInTheDocument();
  });

  // A heading with no image is still a banner.
  it('renders with a heading but no image', () => {
    page = {
      data: {
        id: 'page-1',
        attributes: {
          banner_header_multiloc: { en: 'Welcome' },
          header_bg: null,
        },
      },
    };

    render(<CustomPageBanner />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
