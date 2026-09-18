import React from 'react';

import { makeAdmin, makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import AdminHomePageEditButton from './AdminHomePageEditButton';

// The button's visibility is entirely driven by the authenticated user, via
// the 'homepage'/'edit' permission rule (admin-only).
let mockAuthUser: IUser | undefined;

jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const getButton = () => screen.queryByRole('link', { name: 'Edit homepage' });

describe('<AdminHomePageEditButton />', () => {
  it('is hidden when not logged in', () => {
    mockAuthUser = undefined;
    render(<AdminHomePageEditButton />);

    expect(getButton()).not.toBeInTheDocument();
  });

  it('is hidden for a normal user', () => {
    mockAuthUser = makeUser();
    render(<AdminHomePageEditButton />);

    expect(getButton()).not.toBeInTheDocument();
  });

  it('is hidden for a project moderator', () => {
    mockAuthUser = makeUser({
      highest_role: 'project_moderator',
      roles: [{ type: 'project_moderator', project_id: 'project-1' }],
    });
    render(<AdminHomePageEditButton />);

    expect(getButton()).not.toBeInTheDocument();
  });

  it('is shown for an admin, linking to the homepage builder', () => {
    mockAuthUser = makeAdmin();
    render(<AdminHomePageEditButton />);

    expect(getButton()).toBeInTheDocument();
    expect(getButton()).toHaveAttribute(
      'href',
      '/en/admin/pages-menu/homepage-builder'
    );
  });
});
