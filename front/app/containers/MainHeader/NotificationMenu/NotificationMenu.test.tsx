import React from 'react';
import { IUserAttributes } from 'services/users';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';
import { TNotificationData } from 'services/notifications';

jest.mock('services/appConfiguration');
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
jest.mock('resources/GetNotifications', () => mockNotifications);
// TNotificationData[]

let mockNotifications: {
  list:
    | {
        id: string;
        type: string;
        attributes: TNotificationData;
      }[]
    | null;
} = {
  list: [
    {
      id: '1' as const,
      type: 'notification' as const,
      attributes: {
        type: 'admin_rights_received',
        // read_at: null,
        // created_at: '2022-10-22T00:00:00.000Z',
      },
    },
  ],
};

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

  it('Shows notifications when we have notifications', () => {});

  it('It shows a fallback message when we have no notifications', () => {
    mockNotifications = null;
  });
});
