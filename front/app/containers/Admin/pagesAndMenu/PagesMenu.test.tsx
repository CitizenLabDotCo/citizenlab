import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PagesMenu from '.';

const header = 'Pages';

jest.mock('services/locale');
jest.mock('utils/cl-intl');
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => false));
jest.mock('./messages', () => ({
  pageHeader: { id: 'header', defaultMessage: header },
  pagesMenuTitle: { id: 'tile', defaultMessage: 'menu title' },
  pagesMenuMetaTitle: { id: 'id', defaultMessage: 'menu meta title' },
  pagesMetaTitle: { id: 'header', defaultMessage: 'meta' },
}));

describe('<VisibleNavbarItemList />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    expect(await screen.findByText(header)).toBeInTheDocument();
  });
});
