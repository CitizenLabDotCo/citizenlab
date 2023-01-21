import React from 'react';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';

jest.mock('services/appConfiguration');
jest.mock('services/auth');

describe('NotificationMenu', () => {
  it('Opens the dropdown when clicking the notifications icon', async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);
    const notificationsIcon = screen.getByRole('button');
    const dropdownContent = screen.queryByTestId(
      'notifications-dropdown-content'
    );

    expect(screen.queryByTestId('notifications-dropdown-content')).toBeNull();
    await user.click(notificationsIcon);
    expect(
      screen.findByTestId('notifications-dropdown-content')
    ).toBeInTheDocument();
  });
});
