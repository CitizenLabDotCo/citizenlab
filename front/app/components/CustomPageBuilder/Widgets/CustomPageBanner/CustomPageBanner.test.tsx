import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { CustomPageBannerProps } from './types';

import CustomPageBanner from '.';

let mockInBuilder = true;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => object) =>
    collect({ options: { enabled: mockInBuilder } }),
}));

const banner: CustomPageBannerProps = {
  layout: 'full_width_banner_layout',
  headerMultiloc: { en: 'Welcome' },
  subheaderMultiloc: { en: 'Have your say' },
  overlayColor: null,
  overlayOpacity: null,
  ctaType: 'no_button',
  ctaTextMultiloc: {},
  ctaUrl: null,
  image: { dataCode: 'abc', imageUrl: 'https://example.com/header.jpg' },
};

describe('CustomPageBanner', () => {
  beforeEach(() => {
    mockInBuilder = true;
  });

  it('renders the banner from its props', () => {
    render(<CustomPageBanner {...banner} />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Have your say')).toBeInTheDocument();
    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });

  it('renders a heading-only banner without an image', () => {
    render(<CustomPageBanner {...banner} image={{}} />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  // Fresh from the toolbox there is nothing to show; the builder has to say what it is.
  it('shows a placeholder in the builder when the banner is empty', () => {
    render(<CustomPageBanner {...banner} headerMultiloc={{}} image={{}} />);

    expect(screen.getByText(/Banner\. Add an image/)).toBeInTheDocument();
    expect(
      screen.queryByTestId('full-width-banner-layout')
    ).not.toBeInTheDocument();
  });

  it('renders nothing in the front office when the banner is empty', () => {
    mockInBuilder = false;

    render(<CustomPageBanner {...banner} headerMultiloc={{}} image={{}} />);

    expect(screen.queryByText(/Banner\. Add an image/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('full-width-banner-layout')
    ).not.toBeInTheDocument();
  });
});
