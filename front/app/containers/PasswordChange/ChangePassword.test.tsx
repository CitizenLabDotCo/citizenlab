import React from 'react';
import {
  screen,
  render,
  fireEvent,
  waitFor,
  userEvent,
} from 'utils/testUtils/rtl';
import ChangePassword from '.';
import { changePassword } from 'services/users';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);
jest.mock('services/users', () => ({
  changePassword: jest.fn(() => null),
}));
describe('ChangePassword', () => {
  it('submits correct data', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangePassword />);

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    await user.type(currentPasswordInput, 'test-current-password');

    const newPasswordInput = screen.getByLabelText(/new password/i);
    await user.type(newPasswordInput, 'test-new-password');

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(async () => {
      expect(changePassword).toHaveBeenCalledWith({
        current_password: 'test-current-password',
        new_password: 'test-new-password',
      });

      const successMessage = await screen.findByText(
        'Your password has been successfully updated'
      );

      expect(successMessage).toBeInTheDocument();
    });
  });

  it('shows error messages on invalid data', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangePassword />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    await user.type(newPasswordInput, 'test');

    fireEvent.click(container.querySelector('button[type="submit"]'));

    const currentPasswordError = await screen.findByText(
      'Enter your current password'
    );
    expect(currentPasswordError).toBeInTheDocument();

    const newPasswordError = await screen.findByText(
      'Too short (min. 8 characters)'
    );
    expect(newPasswordError).toBeInTheDocument();
  });
});
