import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import PagesMenu from '.';

const header = 'Pages & Menu';
jest.mock('api/navbar/useNavbarItems');

// `header` is inlined rather than referenced: jest hoists `jest.mock` above
// the imports, so this factory runs while `.` is still being imported —
// before the `const` above is initialised.
jest.mock('./messages', () => ({
  pageHeader: { id: 'header', defaultMessage: 'Pages & Menu' },
  pageSubtitle: { id: 'tile', defaultMessage: 'menu subtitle' },
  createCustomPageButton: { id: 'id', defaultMessage: 'create page' },
  addProject: { id: 'add', defaultMessage: 'add project' },
  navBarMaxItems: { id: 'max', defaultMessage: 'max items' },
}));

describe('<PagesMenu />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    expect(await screen.findByText(header)).toBeInTheDocument();
  });
});
