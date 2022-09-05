import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PagesMenu from '.';

const header = 'Pages';

jest.mock('services/locale');
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => false));
jest.mock('./messages', () => ({
  pageHeader: { id: 'id', defaultMessage: header },
}));

describe('<VisibleNavbarItemList />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    expect(await screen.findByText(header)).toBeInTheDocument();
  });
});
