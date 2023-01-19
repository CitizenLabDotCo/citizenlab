import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderImage from './HeaderImage';
import { mockHomepageSettings } from 'services/__mocks__/homepageSettings';
import { getTheme } from '@citizenlab/cl2-component-library';
import * as styledComponents from 'styled-components';
import { THomepageBannerLayout } from 'services/homepageSettings';

let mockHomepageBannerLayout: THomepageBannerLayout =
  'full_width_banner_layout';

jest.mock('hooks/useHomepageSettings', () =>
  jest.fn(() => mockHomepageSettings(mockHomepageBannerLayout))
);

jest.spyOn(styledComponents, 'useTheme').mockReturnValue(getTheme());

describe('HeaderImage', () => {
  it('the overlay has the right opacity', () => {
    render(<HeaderImage />);
    expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
      'opacity: 0.9'
    );
  });

  describe('When layout is fixed-layout banner', () => {
    it('the overlay has the right opacity', () => {
      mockHomepageBannerLayout = 'fixed_ratio_layout';
      render(<HeaderImage />);
      expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
        'opacity: 1'
      );
    });
  });
});
