import React from 'react';

import { navbarItemsData as navbarItems } from 'api/navbar/__mocks__/useNavbarItems';

import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

import clHistory from 'utils/cl-router/history';
import dragAndDrop from 'utils/testUtils/dragAndDrop';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import VisibleNavbarItemList from '.';

jest.mock('api/navbar/useNavbarItems');

const mockReorderNavbarItem = jest.fn();

jest.mock('api/navbar/useReorderNavbarItems', () =>
  jest.fn(() => ({ mutate: mockReorderNavbarItem }))
);

const mockDeleteCustomPage = jest.fn();

jest.mock('api/custom_pages/useDeleteCustomPage', () =>
  jest.fn(() => ({ mutate: mockDeleteCustomPage }))
);

const mockRemoveNavbarItem = jest.fn();

jest.mock('api/navbar/useDeleteNavbarItem', () =>
  jest.fn(() => ({ mutate: mockRemoveNavbarItem }))
);

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

    expect(mockReorderNavbarItem).toHaveBeenCalledTimes(1);
    expect(mockReorderNavbarItem).toHaveBeenCalledWith({
      id: '2003e851-6cae-4ce8-a0e4-4b930fe73009',
      ordering: 4,
    });
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
    fireEvent.click(editButtons[5]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${ADMIN_PAGES_MENU_PATH}/pages/${navbarItems[5].relationships.static_page.data?.id}/settings`
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
    expect(mockDeleteCustomPage).toHaveBeenCalledWith(
      'e7854e94-3074-4607-b66e-0422aa3d8359'
    );

    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteCustomPage).toHaveBeenCalledWith(
      '793d56cc-c8b3-4422-b393-972b71f82aa2'
    );
  });

  it('calls removeNavbarItem on click remove button with correct id', () => {
    render(<VisibleNavbarItemList />);

    const removeButtons = screen.getAllByText('Remove from navbar');

    fireEvent.click(removeButtons[0]);
    expect(mockRemoveNavbarItem).toHaveBeenCalledWith(
      '2003e851-6cae-4ce8-a0e4-4b930fe73009'
    );
    fireEvent.click(removeButtons[1]);
    expect(mockRemoveNavbarItem).toHaveBeenLastCalledWith(
      'f2e26926-40b6-4692-8321-d1a7ed7ee77c'
    );
  });
});
