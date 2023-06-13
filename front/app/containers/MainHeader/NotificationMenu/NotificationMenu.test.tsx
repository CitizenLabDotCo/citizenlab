import React from 'react';
import { IUserAttributes } from 'api/users/types';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';

const mockUserData: {
  id: string;
  type: string;
  attributes: Partial<IUserAttributes>;
} = {
  id: 'userId',
  type: 'user',
  attributes: {
    unread_notifications: 5,
  },
};

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockUserData },
}));

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
});
