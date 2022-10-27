import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import DesktopNavbar from '.';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('hooks/useNavbarItems');
jest.mock('hooks/useCustomPageSlugById');

const mockAdminPublications = [
  {
    publicationId: '_1',
    publicationType: 'project',
    attributes: {
      publication_title_multiloc: { en: 'Project 1' },
      publication_slug: 'project_one',
    },
  },
];

jest.mock('hooks/useAdminPublications', () =>
  jest.fn(() => ({
    list: mockAdminPublications,
  }))
);

jest.mock('utils/cl-router/Link');

describe('<DesktopNavbar />', () => {
  it('renders', () => {
    const { container } = render(<DesktopNavbar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders correct number of navbar items', () => {
    render(<DesktopNavbar />);
    expect(screen.getAllByTestId('desktop-navbar-item')).toHaveLength(6);
    expect(
      screen.getAllByTestId('admin-publications-navbar-item')
    ).toHaveLength(1);
  });
});
