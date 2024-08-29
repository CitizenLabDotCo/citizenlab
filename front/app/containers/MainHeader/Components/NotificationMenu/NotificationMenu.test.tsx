import React from 'react';

import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import NotificationMenu from '.';

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

describe('NotificationMenu', () => {
  it.skip('Opens and closes the dropdown when clicking the notifications icon', async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);
    const notificationsIcon = screen.getByRole('button');

    await user.click(notificationsIcon);
    const dropdown = screen.getByTestId('notifications-dropdown');
    expect(dropdown).toBeInTheDocument();
  });
});
