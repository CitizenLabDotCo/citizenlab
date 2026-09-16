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

// What the toolbox drops: nothing the header would draw.
const empty: CustomPageBannerProps = {
  ...banner,
  headerMultiloc: {},
  subheaderMultiloc: {},
  image: {},
};

describe('CustomPageBanner', () => {
  beforeEach(() => {
    mockInBuilder = true;
  });

  // Fresh from the toolbox there is nothing to show; the builder has to say what it is.
  it('shows a placeholder in the builder when the banner is empty', () => {
    render(<CustomPageBanner {...empty} />);

    expect(screen.getByText(/Banner\. Add an image/)).toBeInTheDocument();
    expect(
      screen.queryByTestId('full-width-banner-layout')
    ).not.toBeInTheDocument();
  });

  it('renders nothing in the front office when the banner is empty', () => {
    mockInBuilder = false;

    render(<CustomPageBanner {...empty} />);

    expect(screen.queryByText(/Banner\. Add an image/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('full-width-banner-layout')
    ).not.toBeInTheDocument();
  });

  // A page's banner is derived whatever it holds, and the page rendered it before the builder.
  it('renders a banner that has only a subheader', () => {
    mockInBuilder = false;

    render(
      <CustomPageBanner
        {...empty}
        subheaderMultiloc={{ en: 'Have your say' }}
      />
    );

    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });

  it('renders a banner that has only a button', () => {
    mockInBuilder = false;

    render(
      <CustomPageBanner
        {...empty}
        ctaType="customized_button"
        ctaTextMultiloc={{ en: 'Join' }}
      />
    );

    expect(screen.getByTestId('full-width-banner-layout')).toBeInTheDocument();
  });
});
