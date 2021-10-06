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

    expect(
      screen.getByText(messages.navigationItems.defaultMessage!)
    ).toBeInTheDocument();
  });
});
