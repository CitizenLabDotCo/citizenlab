import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SignedOutHeader from '.';

const mockHomepageSettings = {
  id: '1',
  attributes: {
    banner_layout: 'full_width_banner_layout',
    banner_signed_out_header_multiloc: { en: 'Signed out header' },
    banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    header_bg: { large: 'https://example.com/image.png' },
  },
};

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => mockHomepageSettings);
});

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
      render(<SignedOutHeader />);
    });

    testForHeadingsPresence();

    it('maintains the right styles', () => {
      expect(screen.getByTestId('full-width-banner-layout')).toHaveStyle({
        width: '100%',
      });
      expect(
        screen.getByTestId('full-width-banner-layout-header-image')
      ).toHaveStyle({
        'background-image': `url(${mockHomepageSettings.attributes.header_bg?.large})`,
      });
    });
  });

  describe('two_column_layout', () => {
    beforeEach(() => {
      mockHomepageSettings.attributes.banner_layout = 'two_column_layout';
      render(<SignedOutHeader />);
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
        'min-width': '50%',
      });
    });
  });
});

describe('two_row_layout', () => {
  beforeEach(() => {
    mockHomepageSettings.attributes.banner_layout = 'two_row_layout';
    render(<SignedOutHeader />);
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
    mockHomepageSettings.attributes.banner_layout = 'fixed_ratio_layout';
    render(<SignedOutHeader />);
  });

  testForHeadingsPresence();

  it('maintains the right styles', () => {
    expect(
      screen.getByTestId('fixed-ratio-layout-header-image-background')
    ).toHaveStyle(
      `background-image: url(${mockHomepageSettings.attributes.header_bg?.large})`
    );
  });
});
