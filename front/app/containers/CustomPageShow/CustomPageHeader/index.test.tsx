import React from 'react';
import { ICustomPageData } from 'services/customPages';
import { render, screen } from 'utils/testUtils/rtl';
import CustomPageHeader from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const mockPageData = {
  id: '1',
  attributes: {
    banner_layout: 'fixed_ratio_layout',
    banner_header_multiloc: { en: 'Header' },
    banner_subheader_multiloc: { en: 'Subheader' },
    header_bg: { large: 'https://example.com/image.png' },
  },
} as unknown as ICustomPageData;

describe('<CustomPageHeader />', () => {
  it('renders with pageData', () => {
    render(<CustomPageHeader pageData={mockPageData} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('header-image-background')).toHaveStyle(
      `background-image: url(${mockPageData.attributes.header_bg?.large})`
    );
    expect(screen.getByTestId('fixed-ratio-layout')).toBeInTheDocument();
  });

  it('renders with pageData for full_width_banner_layout', () => {
    const mockPageData2 = {
      id: '1',
      attributes: {
        ...mockPageData.attributes,
        banner_layout: 'full_width_banner_layout',
      },
    } as unknown as ICustomPageData;

    render(<CustomPageHeader pageData={mockPageData2} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });
});
