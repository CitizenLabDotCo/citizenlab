import React from 'react';
import HeaderImage from './HeaderImage';
import { THomepageBannerLayout } from 'services/homepageSettings';
import { render, screen } from 'utils/testUtils/rtl';

let mockHomepageBannerLayout: THomepageBannerLayout =
  'full_width_banner_layout';

jest.mock('hooks/useHomepageSettings', () =>
  jest.fn(() => {
    return {
      attributes: {
        banner_layout: mockHomepageBannerLayout,
      },
    };
  })
);

describe('HeaderImage', () => {
  it('the overlay has the right opacity', () => {
    render(<HeaderImage />);
    expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
      'opacity: 0.9'
    );
  });

  describe('When layout is fixed-ratio', () => {
    it('the overlay has the right opacity', () => {
      mockHomepageBannerLayout = 'fixed_ratio_layout';
      render(<HeaderImage />);
      expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
        'opacity: 1'
      );
    });
  });
});
