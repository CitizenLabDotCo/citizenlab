import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import PagesMenu from '.';

const header = 'Pages & Menu';
jest.mock('api/navbar/useNavbarItems');

jest.mock('./messages', () => ({
  pageHeader: { id: 'header', defaultMessage: header },
  pageSubtitle: { id: 'tile', defaultMessage: 'menu subtitle' },
  createCustomPageButton: { id: 'id', defaultMessage: 'create page' },
  addProjectOrFolder: { id: 'add', defaultMessage: 'add project or folder' },
  navBarMaxItems: { id: 'max', defaultMessage: 'max items' },
}));

describe('<PagesMenu />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    expect(await screen.findByText(header)).toBeInTheDocument();
  });
});
