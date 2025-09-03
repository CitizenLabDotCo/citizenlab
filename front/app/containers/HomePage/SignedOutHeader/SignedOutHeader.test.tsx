import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import { render, screen } from 'utils/testUtils/rtl';

import SignedOutHeader from '.';

const mockHomepageSettings: IHomepageBannerSettings = {
  banner_layout: 'full_width_banner_layout',
  banner_signed_out_header_multiloc: { en: 'Signed out header' },
  banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
  banner_signed_in_header_multiloc: { en: 'Signed in header' },
  header_bg: {
    small: 'https://example.com/image.png',
    medium: 'https://example.com/image.png',
    large: 'https://example.com/image.png',
  },
  banner_signed_out_header_overlay_color: null,
  banner_signed_out_header_overlay_opacity: null,
  banner_cta_signed_in_text_multiloc: {},
  banner_cta_signed_in_type: 'no_button',
  banner_cta_signed_in_url: null,
  banner_cta_signed_out_text_multiloc: {},
  banner_cta_signed_out_type: 'no_button',
  banner_cta_signed_out_url: null,
  banner_avatars_enabled: true,
  banner_signed_in_header_overlay_color: null,
  banner_signed_in_header_overlay_opacity: null,
};

function testForHeadingsPresence() {
  it('shows the headings correctly', () => {
    expect(
      screen.getByRole('heading', { name: 'Signed out header', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Signed out subhead', level: 2 })
    ).toBeInTheDocument();
  });
}

describe('<SignedOutHeader />', () => {
  describe('full_width_banner_layout', () => {
    beforeEach(() => {
      render(<SignedOutHeader homepageSettings={mockHomepageSettings} />);
    });

    testForHeadingsPresence();

    it('maintains the right styles', () => {
      expect(screen.getByTestId('full-width-banner-layout')).toHaveStyle({
        width: '100%',
      });
      expect(
        screen.getByTestId('full-width-banner-layout-header-image')
      ).toHaveStyle({
        'background-image': `url(${mockHomepageSettings.header_bg?.large})`,
      });
    });
  });

  describe('two_column_layout', () => {
    beforeEach(() => {
      mockHomepageSettings.banner_layout = 'two_column_layout';
      render(<SignedOutHeader homepageSettings={mockHomepageSettings} />);
    });

    testForHeadingsPresence();

    it('maintains the right styles', () => {
      expect(screen.getByTestId('two-column-layout')).toHaveStyle({
        width: '100%',
        background: 'white',
      });
      expect(
        screen.getByTestId('homepage-two-column-layout-header-image')
      ).toHaveStyle({
        width: '50%',
      });
    });
  });
});

describe('two_row_layout', () => {
  beforeEach(() => {
    mockHomepageSettings.banner_layout = 'two_row_layout';
    render(<SignedOutHeader homepageSettings={mockHomepageSettings} />);
  });

  testForHeadingsPresence();

  it('maintains the right styles', () => {
    expect(screen.getByTestId('two-row-layout')).toHaveStyle({
      width: '100%',
      background: 'white',
    });
  });
});

describe('fixed_ratio_layout', () => {
  beforeEach(() => {
    mockHomepageSettings.banner_layout = 'fixed_ratio_layout';
    render(<SignedOutHeader homepageSettings={mockHomepageSettings} />);
  });

  testForHeadingsPresence();

  it('maintains the right styles', () => {
    expect(
      screen.getByTestId('fixed-ratio-layout-header-image-background')
    ).toHaveStyle(
      `background-image: url(${mockHomepageSettings.header_bg?.large})`
    );
  });
});
