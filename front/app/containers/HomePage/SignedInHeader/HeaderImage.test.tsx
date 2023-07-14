import React from 'react';
import HeaderImage from './HeaderImage';
import { render, screen } from 'utils/testUtils/rtl';

jest.mock('api/home_page/useHomepageSettings');

describe('HeaderImage', () => {
  it('the overlay has the right opacity', () => {
    render(<HeaderImage />);
    expect(screen.getByTestId('signed-in-header-image-overlay')).toHaveStyle(
      'opacity: 0.9'
    );
  });
});
