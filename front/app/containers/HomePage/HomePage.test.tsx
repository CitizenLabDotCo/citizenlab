import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HomePage from '.';
import { mockHomepageSettings } from 'services/__mocks__/homepageSettings';
import { THomepageBannerLayout } from 'services/homepageSettings';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');
jest.mock('services/homepageSettings', () => ({
  updateHomepageSettings: jest.fn(),
}));

const homepageBannerLayout: THomepageBannerLayout = 'full_width_banner_layout';

jest.mock('hooks/useHomepageSettings', () =>
  jest.fn(() => mockHomepageSettings(homepageBannerLayout))
);

describe('<HomePage />', () => {
  it('renders with HomepageSettings for logged out users', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Signed out header', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Signed out subhead', level: 2 })
    ).toBeInTheDocument();
  });
});
