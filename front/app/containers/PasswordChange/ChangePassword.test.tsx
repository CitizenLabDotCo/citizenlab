import React from 'react';
import {
  screen,
  render,
  fireEvent,
  waitFor,
  userEvent,
} from 'utils/testUtils/rtl';
import ChangePassword from '.';
import { IUserData } from 'api/users/types';

const mockUserData: IUserData = {
  id: 'userId',
  type: 'user',
  attributes: {
    first_name: 'Stewie',
    last_name: 'McKenzie',
    locale: 'en',
    slug: 'stewie-mckenzie',
    highest_role: 'admin',
    bio_multiloc: {},
    roles: [{ type: 'admin' }],
    registration_completed_at: '',
    created_at: '',
    updated_at: '',
    unread_notifications: 0,
    invite_status: null,
    confirmation_required: false,
    followings_count: 2,
  },
};

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'nl-NL'])
);

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockUserData },
}));

const mockChangePassword = jest.fn();
jest.mock('api/users/useChangePassword', () =>
  jest.fn(() => ({ mutateAsync: mockChangePassword }))
);

describe('ChangePassword', () => {
  it('submits correct data', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangePassword />);

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    await user.type(currentPasswordInput, 'test-current-password');

    const newPasswordInput = screen.getByLabelText(/new password/i);
    await user.type(newPasswordInput, 'test-new-password');

    fireEvent.click(container.querySelector('#password-submit-button'));

    await waitFor(async () => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        current_password: 'test-current-password',
        password: 'test-new-password',
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

    fireEvent.click(container.querySelector('#password-submit-button'));

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
