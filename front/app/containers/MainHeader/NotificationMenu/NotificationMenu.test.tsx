import React from 'react';
import { IUserAttributes } from 'api/users/types';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';

jest.mock('services/auth');

let mockUserData: {
  id: string;
  type: string;
  attributes: Partial<IUserAttributes>;
} | null = {
  id: 'userId',
  type: 'user',
  attributes: {
    unread_notifications: 5,
  },
};

jest.mock('hooks/useAuthUser', () => jest.fn(() => mockUserData));

describe('NotificationMenu', () => {
  it('Opens and closes the dropdown when clicking the notifications icon', async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);
    const notificationsIcon = screen.getByRole('button');

    // Open the dropdown
    await user.click(notificationsIcon);
    const dropdown = await screen.findByTestId('notifications-dropdown');
    expect(dropdown).toBeInTheDocument();

    // Close the dropdown
    await user.click(notificationsIcon);
    expect(dropdown).not.toBeInTheDocument();
  });

  it('Does not render if the user is not logged in', () => {
    mockUserData = null;
    render(<NotificationMenu />);

    const notificationsIcon = screen.queryByRole('button');
    expect(notificationsIcon).toBeNull();
  });
});
