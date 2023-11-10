import React from 'react';
import HeaderImage from './HeaderImage';
import { render, screen } from 'utils/testUtils/rtl';
import { mockHomepageSettingsData } from 'api/home_page/__mocks__/useHomepageSettings';

describe('HeaderImage', () => {
  it('the overlay has the right opacity', () => {
    render(
      <HeaderImage homepageSettings={mockHomepageSettingsData.attributes} />
    );
    expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
      'opacity: 0.9'
    );
  });
});
