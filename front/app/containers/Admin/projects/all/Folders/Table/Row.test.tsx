import React from 'react';

import {
  Table as TableComponent,
  Tbody,
} from '@citizenlab/cl2-component-library';

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import { TRole } from 'utils/permissions/roles';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Row from './Row';

let mockAuthUserRoles: TRole[] = [];
let mockSpacesEnabled = true;

jest.mock('api/me/useAuthUser', () => () => ({
  data: {
    data: {
      id: 'me',
      type: 'user',
      attributes: {
        first_name: 'Test',
        last_name: 'User',
        roles: mockAuthUserRoles,
        highest_role: 'user',
      },
    },
  },
}));

jest.mock('api/project_folder_images/useProjectFolderImage', () => () => ({
  data: undefined,
}));

// usePermission() reads the app configuration; use the standard manual mock.
jest.mock('api/app_configuration/useAppConfiguration');

jest.mock('hooks/useFeatureFlag', () => () => mockSpacesEnabled);

const mockPush = jest.fn();
jest.mock('utils/cl-router/history', () => ({
  push: (...args: unknown[]) => mockPush(...args),
}));

const folder: MiniProjectFolder = {
  id: 'folder-1',
  type: 'folder_mini',
  attributes: {
    title_multiloc: { en: 'Test folder' },
    visible_projects_count: 3,
    publication_status: 'published',
    space_id: 'space-1',
    space_title_multiloc: { en: 'Test space' },
  },
  relationships: {
    moderators: { data: [] },
    images: { data: [] },
  },
};

const renderRow = () =>
  render(
    <TableComponent>
      <Tbody>
        <Row folder={folder} />
      </Tbody>
    </TableComponent>
  );

describe('Folders table Row — space link', () => {
  beforeEach(() => {
    mockAuthUserRoles = [];
    mockSpacesEnabled = true;
    mockPush.mockClear();
  });

  it('navigates to the space when a moderator of that space clicks it', async () => {
    mockAuthUserRoles = [{ type: 'space_moderator', space_id: 'space-1' }];
    renderRow();

    await userEvent.click(screen.getByText('Test space'));

    expect(mockPush).toHaveBeenCalledWith('/admin/projects/spaces/space-1');
  });

  it('navigates to the space when an admin clicks it', async () => {
    mockAuthUserRoles = [{ type: 'admin' }];
    renderRow();

    await userEvent.click(screen.getByText('Test space'));

    expect(mockPush).toHaveBeenCalledWith('/admin/projects/spaces/space-1');
  });

  it('falls through to the folder when a non-moderator clicks the space', async () => {
    mockAuthUserRoles = [];
    renderRow();

    await userEvent.click(screen.getByText('Test space'));

    expect(mockPush).toHaveBeenCalledWith('/admin/projects/folders/folder-1');
    expect(mockPush).not.toHaveBeenCalledWith('/admin/projects/spaces/space-1');
  });

  it('does not link to the space for a moderator of a different space', async () => {
    mockAuthUserRoles = [{ type: 'space_moderator', space_id: 'other-space' }];
    renderRow();

    await userEvent.click(screen.getByText('Test space'));

    expect(mockPush).not.toHaveBeenCalledWith('/admin/projects/spaces/space-1');
  });

  it('does not show the space when the spaces feature flag is disabled', () => {
    mockSpacesEnabled = false;
    renderRow();

    expect(screen.queryByText('Test space')).not.toBeInTheDocument();
  });
});
