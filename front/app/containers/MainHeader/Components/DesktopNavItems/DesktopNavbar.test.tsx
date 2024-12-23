import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import DesktopNavbar from '.';

jest.mock('api/navbar/useNavbarItems');

const mockAdminPublications = [
  {
    id: '1',
    attributes: {
      publication_title_multiloc: { en: 'Project 1' },
      publication_slug: 'project_one',
    },
    relationships: {
      publication: {
        data: {
          id: '_1',
          type: 'project',
        },
      },
    },
  },
];

jest.mock('api/admin_publications/useAdminPublications', () =>
  jest.fn(() => ({
    data: { pages: [{ data: mockAdminPublications }] },
  }))
);

describe('<DesktopNavbar />', () => {
  it('renders', () => {
    const { container } = render(<DesktopNavbar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders correct number of navbar items', () => {
    render(<DesktopNavbar />);
    expect(screen.getAllByTestId('desktop-navbar-item')).toHaveLength(5);
    expect(
      screen.getAllByTestId('admin-publications-navbar-item')
    ).toHaveLength(1);
  });
});
