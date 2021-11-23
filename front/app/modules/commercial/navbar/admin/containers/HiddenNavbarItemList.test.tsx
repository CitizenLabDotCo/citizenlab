import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HiddenNavbarItemList from './HiddenNavbarItemList';
import messages from './messages';
import { hiddenItems } from 'hooks/fixtures/navbarItems';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

describe('<HiddenNavbarItemList />', () => {
  it('renders', () => {
    const navbarItems = hiddenItems;

    render(<HiddenNavbarItemList navbarItems={navbarItems} />);

    expect(messages.hiddenFromNavigation.defaultMessage).toBeDefined();

    if (!messages.hiddenFromNavigation.defaultMessage) return;

    expect(
      screen.getByText(messages.hiddenFromNavigation.defaultMessage)
    ).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const navbarItems = hiddenItems.slice(0, 2);

    render(<HiddenNavbarItemList navbarItems={navbarItems} />);

    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(2);
  });
});
