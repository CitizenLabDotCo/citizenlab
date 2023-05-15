import React from 'react';
import { screen, render, userEvent } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';

import { PasswordResetSuccess } from './PasswordResetSuccess';

describe('PasswordResetSuccess', () => {
  it('renders a success message with a login button', () => {
    render(<PasswordResetSuccess />);

    expect(
      screen.getByText('Your password has been successfully updated.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Log in');
  });

  it('redirects to the sign in route', async () => {
    const user = userEvent.setup();
    render(<PasswordResetSuccess />);

    const loginButton = screen.getByRole('button');
    await user.click(loginButton);

    expect(clHistory.push).toHaveBeenCalledWith('/');
  });
});
