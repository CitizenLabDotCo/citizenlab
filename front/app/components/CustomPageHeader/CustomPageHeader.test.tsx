import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { CustomPageBannerContent } from './types';

import CustomPageHeader from '.';

const headerBgUrl = 'https://example.com/image.png';

const banner = (
  layout: CustomPageBannerContent['layout']
): CustomPageBannerContent => ({
  layout,
  headerMultiloc: { en: 'Header' },
  subheaderMultiloc: { en: 'Subheader' },
  overlayColor: null,
  overlayOpacity: null,
  ctaType: 'no_button',
  ctaTextMultiloc: {},
  ctaUrl: null,
  imageUrl: headerBgUrl,
});

describe('<CustomPageHeader />', () => {
  it('renders full_width_banner_layout', () => {
    render(<CustomPageHeader banner={banner('full_width_banner_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });

  it('renders two_column_layout', () => {
    render(<CustomPageHeader banner={banner('two_column_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('two-column-layout')).toBeInTheDocument();
  });

  it('renders two_row_layout fixed ratio layout', () => {
    render(<CustomPageHeader banner={banner('two_row_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toHaveStyle('width: 100%');
    expect(screen.getByTestId('two-row-layout')).toHaveStyle(
      'background: white'
    );
  });

  it('renders fixed_ratio_layout', () => {
    render(<CustomPageHeader banner={banner('fixed_ratio_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('header-image-background')).toHaveStyle(
      `background-image: url(${headerBgUrl})`
    );
    expect(screen.getByTestId('fixed-ratio-layout')).toBeInTheDocument();
  });

  // The page decides what the edit affordance is; every layout has a spot for it.
  it('renders the admin edit button slot', () => {
    render(
      <CustomPageHeader
        banner={banner('two_row_layout')}
        adminEditButton={<button>Edit page</button>}
      />
    );
    expect(screen.getByText('Edit page')).toBeInTheDocument();
  });
});
