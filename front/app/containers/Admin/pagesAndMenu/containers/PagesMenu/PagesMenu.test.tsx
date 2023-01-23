import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PagesMenu from '.';

const header = 'Pages & Menu';

jest.mock('utils/cl-intl');
jest.mock('./messages', () => ({
  pageHeader: { id: 'header', defaultMessage: header },
  pageSubtitle: { id: 'tile', defaultMessage: 'menu subtitle' },
  createCustomPageButton: { id: 'id', defaultMessage: 'create page' },
}));

describe('<PagesMenu />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    expect(await screen.findByText(header)).toBeInTheDocument();
  });
});
