import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import HiddenNavbarItemList from '.';
import allNavbarItems from 'hooks/fixtures/navbarItems';
import { addNavbarItem } from '../../../../services/navbar';
import { deletePage } from 'services/pages';
import { NAVIGATION_PATH } from '../..';
import clHistory from 'utils/cl-router/history';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

let mockNavbarItems = allNavbarItems;
const mockRemovedDefaultNavbarItems = [];

jest.mock('hooks/useNavbarItems', () => jest.fn(() => mockNavbarItems));
jest.mock('../../../../hooks/useRemovedDefaultNavbarItems', () =>
  jest.fn(() => mockRemovedDefaultNavbarItems)
);

jest.mock('hooks/usePages');
jest.mock('hooks/usePageSlugById');
jest.mock('hooks/useLocale');

jest.mock('../../../../services/navbar', () => ({
  addNavbarItem: jest.fn(),
}));

jest.mock('services/pages', () => {
  const original = jest.requireActual('services/pages');

  return {
    ...original,
    deletePage: jest.fn(),
  };
});

jest.mock('utils/cl-router/history');

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
      `${NAVIGATION_PATH}/pages/edit/1b095a31-72e1-450a-81be-f6e7a9296553`
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

  it('calls deletePage on click delete button with correct page id', () => {
    render(<HiddenNavbarItemList />);

    const deleteButtons = screen.getAllByText('Delete');

    fireEvent.click(deleteButtons[0]);
    expect(deletePage).toHaveBeenCalledWith(
      '793d56cc-c8b3-4422-b393-972b71f82aa2'
    );

    fireEvent.click(deleteButtons[1]);
    expect(deletePage).toHaveBeenCalledWith(
      'e7854e94-3074-4607-b66e-0422aa3d8359'
    );
  });

  it('has view buttons', () => {
    render(<HiddenNavbarItemList />);

    const viewButtons = screen.getAllByText('View');
    expect(viewButtons).toHaveLength(4);
  });
});
