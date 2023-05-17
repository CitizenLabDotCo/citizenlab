import React from 'react';
import { IUserData } from 'api/users/types';
import clHistory from 'utils/cl-router/history';
import { render, userEvent } from 'utils/testUtils/rtl';
import HomePage, { adminRedirectPath } from '.';

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
  },
};
jest.mock('hooks/useHomepageSettings');
jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});

describe('HomePage', () => {
  it('Tries to redirect on hitting the A key if you have admin access', async () => {
    render(<HomePage />);
    const user = userEvent.setup();
    await user.keyboard('a');

    expect(clHistory.push).toHaveBeenCalledWith(adminRedirectPath);
  });

  it('Does not redirect if you do not have admin access', async () => {
    mockUserData.attributes.roles = [];
    mockUserData.attributes.highest_role = 'user';

    render(<HomePage />);
    const user = userEvent.setup();
    await user.keyboard('a');

    expect(clHistory.push).not.toHaveBeenCalled();
  });
});
