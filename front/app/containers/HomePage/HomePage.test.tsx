import React from 'react';
import clHistory from 'utils/cl-router/history';
import { render, userEvent } from 'utils/testUtils/rtl';
import HomePage, { adminRedirectPath } from '.';
import { mockAuthUserData } from 'api/me/__mocks__/useAuthUser';

jest.mock('api/home_page/useHomepageSettings');
jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

describe('HomePage', () => {
  it.skip('Tries to redirect on hitting the A key if you have admin access', async () => {
    render(<HomePage />);
    const user = userEvent.setup();
    await user.keyboard('a');

    expect(clHistory.push).toHaveBeenCalledWith(adminRedirectPath);
  });

  it.skip('Does not redirect if you do not have admin access', async () => {
    mockAuthUserData.attributes.roles = [];
    mockAuthUserData.attributes.highest_role = 'user';

    render(<HomePage />);
    const user = userEvent.setup();
    await user.keyboard('a');

    expect(clHistory.push).not.toHaveBeenCalled();
  });
});
