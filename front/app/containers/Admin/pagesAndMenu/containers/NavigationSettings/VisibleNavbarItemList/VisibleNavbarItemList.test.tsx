import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import navbarItems from 'services/__mocks__/navbarItems';
import React from 'react';
import clHistory from 'utils/cl-router/history';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';
import VisibleNavbarItemList from '.';
import { removeNavbarItem, reorderNavbarItem } from 'services/navbar';
import { deleteCustomPage } from 'services/customPages';
import dragAndDrop from 'utils/testUtils/dragAndDrop';

jest.mock('hooks/useNavbarItems');
jest.mock('hooks/useCustomPageSlugById');

jest.mock('services/navbar', () => ({
  reorderNavbarItem: jest.fn(),
  removeNavbarItem: jest.fn(),
  getNavbarItemSlug: jest.fn(),
}));

jest.mock('services/customPages', () => ({
  deleteCustomPage: jest.fn(),
}));

describe('<VisibleNavbarItemList />', () => {
  it('renders', () => {
    render(<VisibleNavbarItemList />);

    expect(
      screen.getByText('Pages shown on your navigation bar')
    ).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    render(<VisibleNavbarItemList />);
    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(7);
  });

  it('render correct number of locked rows', () => {
    render(<VisibleNavbarItemList />);
    expect(screen.getAllByTestId('locked-row')).toHaveLength(2);
  });

  it('calls onReorder with correct id and position on reorder', () => {
    render(<VisibleNavbarItemList />);

    const rows = screen.getAllByTestId('navbar-item-row');

    const thirdRow = rows[2];
    const fifthRow = rows[4];

    dragAndDrop(fifthRow, thirdRow);

    expect(reorderNavbarItem).toHaveBeenCalledTimes(1);
    expect(reorderNavbarItem).toHaveBeenCalledWith(
      '2003e851-6cae-4ce8-a0e4-4b930fe73009',
      4
    );
  });

  it('calls clHistory.push on click edit with correct arg (default item)', () => {
    render(<VisibleNavbarItemList />);

    const editButtons = screen.getAllByText('Edit');

    // 'All projects' edit button, 'Home' is index zero  one
    fireEvent.click(editButtons[1]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${ADMIN_PAGES_MENU_PATH}/navbar-items/edit/${navbarItems[1].id}`
    );
  });

  it('calls clHistory.push on click edit with correct arg (page)', () => {
    render(<VisibleNavbarItemList />);

    const editButtons = screen.getAllByText('Edit');

    // 'About' edit button, 'Home' doesn't have one
    fireEvent.click(editButtons[6]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${ADMIN_PAGES_MENU_PATH}/pages/${navbarItems[6].relationships.static_page.data?.id}/settings`
    );
  });

  it('has view buttons', () => {
    render(<VisibleNavbarItemList />);

    const viewButtons = screen.getAllByText('View');
    expect(viewButtons).toHaveLength(7);
  });

  it('calls deleteCustomPage on click delete button with correct page id', () => {
    render(<VisibleNavbarItemList />);

    const deleteButtons = screen.getAllByText('Delete');

    fireEvent.click(deleteButtons[0]);
    expect(deleteCustomPage).toHaveBeenCalledWith(
      'e7854e94-3074-4607-b66e-0422aa3d8359'
    );

    fireEvent.click(deleteButtons[1]);
    expect(deleteCustomPage).toHaveBeenCalledWith(
      '793d56cc-c8b3-4422-b393-972b71f82aa2'
    );
  });

  it('calls removeNavbarItem on click remove button with correct id', () => {
    render(<VisibleNavbarItemList />);

    const removeButtons = screen.getAllByText('Remove from navbar');

    fireEvent.click(removeButtons[0]);
    expect(removeNavbarItem).toHaveBeenCalledWith(
      '2003e851-6cae-4ce8-a0e4-4b930fe73009'
    );
    fireEvent.click(removeButtons[1]);
    expect(removeNavbarItem).toHaveBeenLastCalledWith(
      '037c953a-f717-4d17-beca-b0b684335b7b'
    );
  });
});
