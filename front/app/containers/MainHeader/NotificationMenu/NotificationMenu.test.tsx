import React from 'react';
import { IUserAttributes } from 'services/users';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';

jest.mock('services/auth');

const mockUserData: {
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

type MockUserData = { data: typeof mockUserData } | null;
let mockAuthUser: MockUserData = {
  data: mockUserData,
};

jest.mock('api/me/useAuthUser', () => jest.fn(() => ({ data: mockAuthUser })));

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
    mockAuthUser = null;
    render(<NotificationMenu />);

    const notificationsIcon = screen.queryByRole('button');
    expect(notificationsIcon).toBeNull();
  });
});
