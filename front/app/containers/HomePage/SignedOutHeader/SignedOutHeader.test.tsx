import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SignedOutHeader from '.';
import { mockHomepageSettingsData } from 'api/home_page/__mocks__/useHomepageSettings';

jest.mock('api/home_page/useHomepageSettings', () => {
  return jest.fn(() => ({
    data: {
      data: mockHomepageSettingsData,
    },
  }));
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
        'background-image': `url(${mockHomepageSettingsData.attributes.header_bg?.large})`,
      });
    });
  });

  describe('two_column_layout', () => {
    beforeEach(() => {
      mockHomepageSettingsData.attributes.banner_layout = 'two_column_layout';
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
    mockHomepageSettingsData.attributes.banner_layout = 'two_row_layout';
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
    mockHomepageSettingsData.attributes.banner_layout = 'fixed_ratio_layout';
    render(<SignedOutHeader />);
  });

  testForHeadingsPresence();

  it('maintains the right styles', () => {
    expect(
      screen.getByTestId('fixed-ratio-layout-header-image-background')
    ).toHaveStyle(
      `background-image: url(${mockHomepageSettingsData.attributes.header_bg?.large})`
    );
  });
});
