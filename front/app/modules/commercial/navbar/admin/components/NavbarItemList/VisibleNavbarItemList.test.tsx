import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import VisibleNavbarItemList from './VisibleNavbarItemList';
import messages from './messages';
import { generateNavbarItems } from './_testUtils';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

describe('<VisibleNavbarItemList />', () => {
  it('renders', () => {
    const navbarItems: any = generateNavbarItems(3);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={2} />
    );

    expect(messages.navigationItems.defaultMessage).toBeDefined();

    if (!messages.navigationItems.defaultMessage) return;

    expect(
      screen.getByText(messages.navigationItems.defaultMessage)
    ).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const navbarItems: any = generateNavbarItems(5);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={2} />
    );

    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(5);
  });

  it('render correct number of locked rows', () => {
    const navbarItems: any = generateNavbarItems(5);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={3} />
    );

    expect(screen.getAllByTestId('locked-row')).toHaveLength(3);
  });
});
