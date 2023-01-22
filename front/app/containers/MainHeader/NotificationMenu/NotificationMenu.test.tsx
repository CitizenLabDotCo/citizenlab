import React from 'react';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import NotificationMenu from '.';

jest.mock('services/appConfiguration');
jest.mock('services/auth');

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
