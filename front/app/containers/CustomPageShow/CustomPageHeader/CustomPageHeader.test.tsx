import React from 'react';
import { ICustomPageData } from 'services/customPages';
import { THomepageBannerLayout } from 'services/homepageSettings';
import { render, screen } from 'utils/testUtils/rtl';
import CustomPageHeader from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const headerBgUrl = 'https://example.com/image.png';

function mockPageData(bannerLayout: THomepageBannerLayout) {
  return {
    id: '1',
    attributes: {
      banner_layout: bannerLayout,
      banner_header_multiloc: { en: 'Header' },
      banner_subheader_multiloc: { en: 'Subheader' },
      header_bg: { large: headerBgUrl },
    },
  } as unknown as ICustomPageData;
}

describe('<CustomPageHeader />', () => {
  it('renders full width banner layout', () => {
    render(
      <CustomPageHeader pageData={mockPageData('full_width_banner_layout')} />
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });

  it('renders two column layout', () => {
    render(<CustomPageHeader pageData={mockPageData('two_column_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('two-column-layout')).toBeInTheDocument();
  });

  it('renders two row layout fixed ratio layout', () => {
    render(<CustomPageHeader pageData={mockPageData('two_row_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toBeInTheDocument();
  });

  it('renders fixed ratio layout', () => {
    render(<CustomPageHeader pageData={mockPageData('fixed_ratio_layout')} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('header-image-background')).toHaveStyle(
      `background-image: url(${headerBgUrl})`
    );
    expect(screen.getByTestId('fixed-ratio-layout')).toBeInTheDocument();
  });
});
