import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HiddenNavbarItemList from './HiddenNavbarItemList';
import messages from './messages';
import { generateNavbarItems } from './_testUtils';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

describe('<HiddenNavbarItemList />', () => {
  it('renders', () => {
    const navbarItems: any = generateNavbarItems(3);

    render(<HiddenNavbarItemList navbarItems={navbarItems} />);

    expect(messages.hiddenFromNavigation.defaultMessage).toBeDefined();

    if (!messages.hiddenFromNavigation.defaultMessage) return;

    expect(
      screen.getByText(messages.hiddenFromNavigation.defaultMessage)
    ).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const navbarItems: any = generateNavbarItems(5);

    render(<HiddenNavbarItemList navbarItems={navbarItems} />);

    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(5);
  });
});
