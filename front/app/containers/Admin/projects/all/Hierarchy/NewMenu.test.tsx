import React from 'react';

import { HighestRole } from 'api/users/types';

import { TRole } from 'utils/permissions/roles';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

import NewMenu from './NewMenu';

import 'utils/permissions/rules/projectFolderPermissions';
import 'utils/permissions/rules/spacePermissions';

let mockRoles: TRole[] = [];
let mockHighestRole: HighestRole = 'user';
let mockSpacesEnabled = true;

jest.mock('api/me/useAuthUser', () => () => ({
  data: {
    data: {
      id: 'me',
      type: 'user',
      attributes: { roles: mockRoles, highest_role: mockHighestRole },
    },
  },
}));

// usePermission() reads the app configuration; use the standard manual mock.
jest.mock('api/app_configuration/useAppConfiguration');

jest.mock('hooks/useFeatureFlag', () => () => mockSpacesEnabled);
jest.mock('hooks/useProjectBackofficeRedesign', () => () => true);

const menuItems = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'New' }));
  return screen.getAllByRole('menuitem').map((item) => item.textContent);
};

describe('NewMenu', () => {
  beforeEach(() => {
    mockRoles = [];
    mockHighestRole = 'user';
    mockSpacesEnabled = true;
  });

  it('offers spaces, folders and projects to admins', async () => {
    mockRoles = [{ type: 'admin' }];
    mockHighestRole = 'admin';
    render(<NewMenu />);

    expect(await menuItems()).toEqual(['Space', 'Folder', 'Project']);
  });

  it('leaves spaces out when spaces are off', async () => {
    mockRoles = [{ type: 'admin' }];
    mockHighestRole = 'admin';
    mockSpacesEnabled = false;
    render(<NewMenu />);

    expect(await menuItems()).toEqual(['Folder', 'Project']);
  });

  it('offers folders and projects to space managers', async () => {
    mockRoles = [{ type: 'space_moderator', space_id: 'space-1' }];
    mockHighestRole = 'space_moderator';
    render(<NewMenu />);

    expect(await menuItems()).toEqual(['Folder', 'Project']);
  });

  it('shows the plain project button to those who can only create projects', () => {
    mockRoles = [
      { type: 'project_folder_moderator', project_folder_id: 'folder-1' },
    ];
    mockHighestRole = 'project_folder_moderator';
    render(<NewMenu />);

    expect(
      screen.queryByRole('button', { name: 'New' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'New project' })
    ).toBeInTheDocument();
  });
});
