import React from 'react';
import { fireEvent, render, screen, within } from 'utils/testUtils/rtl';
import allNavbarItems from 'hooks/fixtures/navbarItems';
import VisibleNavbarItemList from '.';
import clHistory from 'utils/cl-router/history';

const mockNavbarItems = allNavbarItems;

jest.mock('services/locale');
jest.mock('hooks/useCustomPageSlugById', () => jest.fn(() => 'slug'));
jest.mock('hooks/useNavbarItems', () => jest.fn(() => mockNavbarItems));
jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-router/history');

describe('<VisibleNavbarItemList />', () => {
  it('renders', async () => {
    render(<VisibleNavbarItemList />);

    const navbarItemRows = await screen.findAllByTestId('navbar-item-row');
    expect(navbarItemRows.length).toEqual(mockNavbarItems.length);
    expect(navbarItemRows.length).toBeGreaterThan(0);
  });

  it('renders page url for navbar item with static page', async () => {
    render(<VisibleNavbarItemList />);

    const navbarItemRows = await screen.findAllByTestId('navbar-item-row');
    const itemWithPage = mockNavbarItems.find(
      (item) => item.relationships.static_page.data
    );
    expect(itemWithPage).toBeTruthy();
    if (!itemWithPage) {
      return;
    }
    fireEvent.click(
      within(navbarItemRows[itemWithPage.attributes.ordering]).getByTestId(
        'edit-button'
      )
    );
    expect(clHistory.push).toHaveBeenCalledWith(
      `/admin/pages-menu/pages/${itemWithPage.relationships.static_page.data?.id}/settings`
    );
  });

  it('renders navbar item url for navbar item without static page', async () => {
    render(<VisibleNavbarItemList />);

    const navbarItemRows = await screen.findAllByTestId('navbar-item-row');
    const itemWithPage = mockNavbarItems.find(
      (item) =>
        !item.relationships.static_page.data && item.attributes.code !== 'home'
    );
    expect(itemWithPage).toBeTruthy();
    if (!itemWithPage) {
      return;
    }
    fireEvent.click(
      within(navbarItemRows[itemWithPage.attributes.ordering]).getByTestId(
        'edit-button'
      )
    );
    expect(clHistory.push).toHaveBeenCalledWith(
      `/admin/pages-menu/navbar-items/edit/${itemWithPage.id}`
    );
  });
});
