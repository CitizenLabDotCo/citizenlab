import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import VisibleNavbarItemList from '.';
import { reorderNavbarItem, removeNavbarItem } from '../../../services/navbar';
import { deletePage } from '../../../services/pages';
import { NAVIGATION_PATH } from '../';
import navbarItems from 'hooks/fixtures/navbarItems';
import clHistory from 'utils/cl-router/history';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('hooks/useNavbarItems');
jest.mock('hooks/usePageSlugById');
jest.mock('hooks/useLocale');

jest.mock('../../../services/navbar', () => ({
  reorderNavbarItem: jest.fn(),
  removeNavbarItem: jest.fn(),
}));

jest.mock('../../../services/pages', () => ({
  deletePage: jest.fn(),
}));

jest.mock('utils/cl-router/history');

window.open = jest.fn();

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

    const thirdItem = rows[2];
    const fifthItem = rows[4];

    fireEvent.dragStart(thirdItem);
    fireEvent.dragEnter(fifthItem);
    fireEvent.dragOver(fifthItem);
    fireEvent.drop(fifthItem);

    expect(reorderNavbarItem).toHaveBeenCalledTimes(1);
    expect(reorderNavbarItem).toHaveBeenCalledWith(
      '2003e851-6cae-4ce8-a0e4-4b930fe73009',
      4
    );
  });

  it('calls clHistory.push on click edit with correct arg (default item)', () => {
    render(<VisibleNavbarItemList />);

    const editButtons = screen.getAllByText('Edit');

    // 'All projects' edit button, 'Home' doesn't have one
    fireEvent.click(editButtons[0]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${NAVIGATION_PATH}/navbar-items/edit/${navbarItems[1].id}`
    );
  });

  it('calls clHistory.push on click edit with correct arg (page)', () => {
    render(<VisibleNavbarItemList />);

    const editButtons = screen.getAllByText('Edit');

    // 'About' edit button, 'Home' doesn't have one
    fireEvent.click(editButtons[5]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${NAVIGATION_PATH}/pages/edit/${navbarItems[6].relationships.static_page.data?.id}`
    );
  });

  it('calls window.open on click view button with correct slug', () => {
    render(<VisibleNavbarItemList />);

    const viewButtons = screen.getAllByText('View');

    fireEvent.click(viewButtons[2]);
    expect(window.open).toHaveBeenCalledWith(
      'https://demo.stg.citizenlab.co/en/ideas',
      '_blank'
    );

    fireEvent.click(viewButtons[6]);
    expect(window.open).toHaveBeenCalledWith(
      'https://demo.stg.citizenlab.co/en/pages/faq',
      '_blank'
    );
  });

  it('calls deletePage on click delete button with correct page id', () => {
    render(<VisibleNavbarItemList />);

    const deleteButtons = screen.getAllByText('Delete');

    fireEvent.click(deleteButtons[0]);
    expect(deletePage).toHaveBeenCalledWith(
      'e7854e94-3074-4607-b66e-0422aa3d8359'
    );

    fireEvent.click(deleteButtons[1]);
    expect(deletePage).toHaveBeenCalledWith(
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
