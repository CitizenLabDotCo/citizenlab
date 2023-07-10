import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import allNavbarItems from 'services/__mocks__/navbarItems';
import React from 'react';
import clHistory from 'utils/cl-router/history';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';
import HiddenNavbarItemList from '.';
import { addNavbarItem } from 'services/navbar';

let mockNavbarItems = allNavbarItems;
const mockRemovedDefaultNavbarItems = [];

// jest.mock('api/navbar/useNavbarItems', () =>
//   jest.fn(() => ({ data: mockNavbarItems }))
// );

jest.mock('api/navbar/useNavbarItems', () => {
  return jest.fn((params) => {
    return params?.onlyRemovedDefaultItems
      ? { data: mockRemovedDefaultNavbarItems }
      : { data: mockNavbarItems };
  });
});

jest.mock('api/custom_pages/useCustomPages');
jest.mock('api/custom_pages/useCustomPageSlugById');

const mockDeleteCustomPage = jest.fn();

jest.mock('api/custom_pages/useDeleteCustomPage', () =>
  jest.fn(() => ({ mutate: mockDeleteCustomPage }))
);

jest.mock('services/navbar', () => ({
  addNavbarItem: jest.fn(),
  getNavbarItemSlug: jest.fn(),
}));

jest.mock('api/custom_pages/types', () => {
  const original = jest.requireActual('api/custom_pages/types');

  return {
    ...original,
    deleteCustomPage: jest.fn(),
  };
});

describe('<HiddenNavbarItemList />', () => {
  it('renders', () => {
    render(<HiddenNavbarItemList />);

    expect(screen.getByText('Other available pages')).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    render(<HiddenNavbarItemList />);
    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(2);
  });

  it('calls clHistory.push on click edit with correct arg (page)', () => {
    render(<HiddenNavbarItemList />);

    const editButtons = screen.getAllByText('Edit');

    fireEvent.click(editButtons[0]);

    expect(clHistory.push).toHaveBeenCalledWith(
      `${ADMIN_PAGES_MENU_PATH}/pages/1b095a31-72e1-450a-81be-f6e7a9296553/settings`
    );
  });

  it('does not call addNavbarItem on click Add button if navbar is full', () => {
    render(<HiddenNavbarItemList />);

    const addButtons = screen.getAllByText('Add to navbar');

    fireEvent.click(addButtons[0]);
    expect(addNavbarItem).not.toHaveBeenCalled();

    fireEvent.click(addButtons[1]);
    expect(addNavbarItem).not.toHaveBeenCalled();
  });

  it('calls addNavbarItem on click add button with correct data', () => {
    mockNavbarItems = allNavbarItems.slice(0, 5);

    render(<HiddenNavbarItemList />);

    const addButtons = screen.getAllByText('Add to navbar');

    const faqItem = {
      pageCode: 'faq',
      pageId: '793d56cc-c8b3-4422-b393-972b71f82aa2',
      pageTitleMultiloc: { en: 'FAQ' },
      type: 'page',
    };

    fireEvent.click(addButtons[0]);
    expect(addNavbarItem).toHaveBeenCalledWith(faqItem);

    const aboutItem = {
      pageCode: 'about',
      pageId: 'e7854e94-3074-4607-b66e-0422aa3d8359',
      pageTitleMultiloc: { en: 'About' },
      type: 'page',
    };

    fireEvent.click(addButtons[1]);
    expect(addNavbarItem).toHaveBeenCalledWith(aboutItem);
  });

  it('calls deleteCustomPage on click delete button with correct page id', () => {
    render(<HiddenNavbarItemList />);

    const deleteButtons = screen.getAllByText('Delete');

    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteCustomPage).toHaveBeenCalledWith(
      '793d56cc-c8b3-4422-b393-972b71f82aa2'
    );

    fireEvent.click(deleteButtons[1]);
    expect(mockDeleteCustomPage).toHaveBeenCalledWith(
      'e7854e94-3074-4607-b66e-0422aa3d8359'
    );
  });

  it('has view buttons', () => {
    render(<HiddenNavbarItemList />);

    const viewButtons = screen.getAllByText('View');
    expect(viewButtons).toHaveLength(4);
  });
});
