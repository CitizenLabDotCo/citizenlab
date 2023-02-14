import React from 'react';
import clHistory from 'utils/cl-router/history';
import { render, userEvent } from 'utils/testUtils/rtl';
import HomePage, { adminRedirectPath } from '.';

const mockHomepageSettings = {
  attributes: {
    banner_layout: 'full_width_banner_layout',
    banner_signed_out_header_multiloc: { en: 'Signed out header' },
    banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    header_bg: { large: 'https://example.com/image.png' },
  },
};

const mockUser = {
  id: 'userId',
  attributes: {
    roles: [{ type: 'admin' }],
  },
};

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => mockHomepageSettings);
});
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
