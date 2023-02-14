import React from 'react';
import clHistory from 'utils/cl-router/history';
import { render, userEvent } from 'utils/testUtils/rtl';
import HomePage, { adminRedirectPath } from '.';

const mockUser = {
  id: 'userId',
  attributes: {
    roles: [{ type: 'admin' }],
  },
};

jest.mock('hooks/useHomepageSettings');
jest.mock('hooks/useAuthUser', () => {
  return () => mockUser;
});
jest.mock('hooks/useAppConfiguration', () => {
  return jest.fn(() => ({
    attributes: {
      settings: {
        core: {
          lifecycle_stage: 'active',
          organization_name: {
            en: 'Org name',
          },
        },
      },
    },
  }));
});

describe('HomePage', () => {
  it('Tries to redirect on hitting the A key if you have admin access', async () => {
    render(<HomePage />);
    const user = userEvent.setup();
    await user.keyboard('a');

    expect(clHistory.push).toHaveBeenCalledWith(adminRedirectPath);
  });
});
