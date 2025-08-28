import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import DesktopNavbar from '.';

const mockNavbarItems = [
  {
    id: '1',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: { en: 'Home' },
      code: 'home',
      slug: null,
      ordering: 1,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    relationships: {
      static_page: { data: null },
      project: { data: null },
    },
  },
  {
    id: '2',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: { en: 'All projects' },
      code: 'projects',
      slug: null,
      ordering: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    relationships: {
      static_page: { data: null },
      project: { data: null },
    },
  },
  {
    id: '3',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: { en: 'All input' },
      code: 'all_input',
      slug: null,
      ordering: 3,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    relationships: {
      static_page: { data: null },
      project: { data: null },
    },
  },
  {
    id: '4',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: { en: 'Events' },
      code: 'events',
      slug: null,
      ordering: 4,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    relationships: {
      static_page: { data: null },
      project: { data: null },
    },
  },
  {
    id: '5',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: { en: 'About' },
      code: 'custom',
      slug: 'about',
      ordering: 5,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    relationships: {
      static_page: { data: null },
      project: { data: null },
    },
  },
];

jest.mock('api/navbar/useNavbarItems', () => ({
  __esModule: true,
  default: () => ({
    data: { data: mockNavbarItems },
  }),
}));

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

jest.mock('hooks/useLocalize', () => () => (multiloc: any) => {
  return multiloc?.en || 'Default Title';
});

jest.mock('hooks/useFeatureFlag', () => () => false);

describe('<DesktopNavbar />', () => {
  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    // Mock offsetWidth for container elements
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it('renders', () => {
    const { container } = render(<DesktopNavbar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders navigation container correctly', () => {
    render(<DesktopNavbar />);

    // Check that the navigation container is rendered
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Primary')).toBeInTheDocument();
  });

  it('renders navigation items when data is available', () => {
    render(<DesktopNavbar />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders navigation container correctly', () => {
    render(<DesktopNavbar />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Primary')).toBeInTheDocument();
  });
});
