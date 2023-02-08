import React from 'react';
import { screen, render, fireEvent } from 'utils/testUtils/rtl';

import { PasswordResetSuccess } from './PasswordResetSuccess';

const mockSignInModal = jest.fn();

jest.mock('events/openSignUpInModal', () => ({
  openSignUpInModal: () => mockSignInModal(),
}));

describe('PasswordResetSuccess', () => {
  it('renders a success message with a login button', () => {
    render(<PasswordResetSuccess />);

    expect(
      screen.getByText('Your password has been successfully updated.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Log in');
  });

  it('opens sign in modal after clicking on the login button', async () => {
    render(<PasswordResetSuccess />);

    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    expect(mockSignInModal).toHaveBeenCalledTimes(1);
  });
});
