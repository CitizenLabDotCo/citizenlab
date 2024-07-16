import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import HeaderImage from './HeaderImage';

const mockHomepageSettings = {
  header_bg: {
    small: 'https://example.com/image.png',
    medium: 'https://example.com/image.png',
    large: 'https://example.com/image.png',
  },
};

describe('HeaderImage', () => {
  it('the overlay has the right opacity', () => {
    render(<HeaderImage homepageSettings={mockHomepageSettings} />);
    expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
      'opacity: 0.9'
    );
  });
});
