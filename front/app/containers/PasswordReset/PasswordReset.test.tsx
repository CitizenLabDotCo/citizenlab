import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';

jest.mock('utils/cl-router/Link', () => 'Link');

jest.mock('utils/cl-router/history', () => ({
  location: {
    search: '?token=test-token',
  },
  push: jest.fn(),
}));

jest.mock('services/auth', () => ({
  resetPassword: () => jest.fn(),
}));

import PasswordReset from './index';

describe('PasswordReset', () => {
  it('renders a success message with a login button after password reset', async () => {
    render(<PasswordReset />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: {
        value: 'test-new-password',
      },
    });

    const submitButton = screen.getByText(/Confirm new password/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Your password has been successfully updated.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Log in');
    });
  });
});
