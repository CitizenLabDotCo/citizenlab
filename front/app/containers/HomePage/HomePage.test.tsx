import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HomePage from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');

jest.mock('services/homepageSettings', () => ({
  updateHomepageSettings: jest.fn(),
}));

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

describe('<HomePage />', () => {
  it('renders with HomepageSettings for logged out users', () => {
    render(<HomePage />);
    expect(screen.getByText('Signed out header')).toBeInTheDocument();
    expect(screen.getByText('Signed out subhead')).toBeInTheDocument();
  });
});
