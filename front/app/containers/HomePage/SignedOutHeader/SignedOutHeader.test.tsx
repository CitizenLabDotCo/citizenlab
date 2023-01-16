import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SignedOutHeader from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const mockHomepageSettings = {
  id: '1',
  attributes: {
    banner_layout: 'fixed_ratio_layout',
    banner_signed_out_header_multiloc: { en: 'Signed out header' },
    banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    header_bg: { large: 'https://example.com/image.png' },
  },
};

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => mockHomepageSettings);
});

describe('<SignedOutHeader />', () => {
  it('renders full_width_banner_layout', () => {
    mockHomepageSettings.attributes.banner_layout = 'full_width_banner_layout';

    render(<SignedOutHeader />);
    expect(screen.getByText('Signed out header')).toBeInTheDocument();
    expect(screen.getByText('Signed out subhead')).toBeInTheDocument();
    expect(screen.getByTestId('full-width-banner-layout')).toHaveStyle(
      'width: 100%'
    );
  });

  it('renders two_column_layout', () => {
    mockHomepageSettings.attributes.banner_layout = 'two_column_layout';

    render(<SignedOutHeader />);
    expect(screen.getByText('Signed out header')).toBeInTheDocument();
    expect(screen.getByText('Signed out subhead')).toBeInTheDocument();
    expect(screen.getByTestId('two-column-layout')).toBeInTheDocument();
    expect(screen.getByTestId('two-column-layout')).toHaveStyle('width: 100%');
    expect(screen.getByTestId('two-column-layout')).toHaveStyle(
      'background: white'
    );
  });

  it('renders two_row_layout', () => {
    mockHomepageSettings.attributes.banner_layout = 'two_row_layout';

    render(<SignedOutHeader />);
    expect(screen.getByText('Signed out header')).toBeInTheDocument();
    expect(screen.getByText('Signed out subhead')).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toHaveStyle('width: 100%');
    expect(screen.getByTestId('two-row-layout')).toHaveStyle(
      'background: white'
    );
  });

  it('renders fixed_ratio_layout', () => {
    mockHomepageSettings.attributes.banner_layout = 'fixed_ratio_layout';

    render(<SignedOutHeader />);
    expect(screen.getByText('Signed out header')).toBeInTheDocument();
    expect(screen.getByText('Signed out subhead')).toBeInTheDocument();
    expect(screen.getByTestId('header-image-background')).toHaveStyle(
      `background-image: url(${mockHomepageSettings.attributes.header_bg?.large})`
    );
    expect(screen.getByTestId('fixed-ratio-layout')).toBeInTheDocument();
  });
});
