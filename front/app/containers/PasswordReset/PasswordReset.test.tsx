import React from 'react';
import { screen, render, userEvent } from 'utils/testUtils/rtl';

jest.mock('utils/cl-router/Link', () => 'Link');

jest.mock('utils/cl-router/history', () => ({
  location: {
    search: '?token=test-token',
  },
  push: jest.fn(),
}));

jest.mock('api/authentication/reset_password/resetPassword', () => jest.fn());

import PasswordReset from './index';

describe('PasswordReset', () => {
  it('renders a success message with a login button after password reset', async () => {
    const user = userEvent.setup();
    render(<PasswordReset />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'test-new-password');

    const submitButton = screen.getByRole('button', {
      name: /confirm new password/i,
    });
    await user.click(submitButton);

    const successMessage = await screen.findByText(
      'Your password has been successfully updated.'
    );
    const loginButton = await screen.findByRole('button', { name: /log in/i });

    expect(successMessage).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });
});
