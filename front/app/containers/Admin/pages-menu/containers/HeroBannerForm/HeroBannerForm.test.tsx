import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HeroBannerForm from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('hooks/useNavbarItems');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');

describe('<HeroBannerForm />', () => {
  it('renders', () => {
    const { container } = render(<HeroBannerForm />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders three default buttons', () => {
    render(<HeroBannerForm />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('All projects')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
