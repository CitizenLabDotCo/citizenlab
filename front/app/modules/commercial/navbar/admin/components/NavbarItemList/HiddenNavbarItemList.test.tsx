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

    expect(
      screen.getByText(messages.hiddenFromNavigation.defaultMessage!)
    ).toBeInTheDocument();
  });
});
