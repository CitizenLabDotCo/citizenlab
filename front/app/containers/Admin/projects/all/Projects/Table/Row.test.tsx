import React from 'react';

import {
  Table as TableComponent,
  Tbody,
} from '@citizenlab/cl2-component-library';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { TRole } from 'utils/permissions/roles';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Row from './Row';

let mockAuthUserRoles: TRole[] = [];

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

jest.mock('api/project_images/useProjectImage', () => () => ({
  data: undefined,
}));

const project: ProjectMiniAdminData = {
  id: 'project-1',
  type: 'project_mini_admin',
  attributes: {
    current_phase_start_date: null,
    current_phase_end_date: null,
    first_phase_start_date: null,
    first_published_at: null,
    folder_title_multiloc: { en: 'Test folder' },
    last_phase_end_date: null,
    listed: true,
    publication_status: 'published',
    title_multiloc: { en: 'Test project' },
    visible_to: 'public',
  },
  relationships: {
    folder: { data: { id: 'folder-1', type: 'project_folder' } },
    space: { data: { id: 'space-1', type: 'space' } },
    phases: { data: [] },
    project_images: { data: [] },
    groups: { data: [] },
    moderators: { data: [] },
  },
};

const renderRow = () =>
  render(
    <TableComponent>
      <Tbody>
        <Row project={project} firstRow />
      </Tbody>
    </TableComponent>
  );

const findRowLink = () =>
  screen.getByText('Test project').closest('a') as HTMLAnchorElement;

describe('Projects table Row — folder link', () => {
  beforeEach(() => {
    mockAuthUserRoles = [];
  });

  it('does not link to the folder when the user cannot moderate it', async () => {
    mockAuthUserRoles = [];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink()).toHaveAttribute(
      'href',
      expect.stringContaining(`/admin/projects/${project.id}`)
    );
    expect(findRowLink().getAttribute('href')).not.toContain(
      'folders/folder-1'
    );
  });

  it('does not link to the folder for a moderator of a different folder', async () => {
    mockAuthUserRoles = [
      { type: 'project_folder_moderator', project_folder_id: 'other-folder' },
    ];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink().getAttribute('href')).not.toContain(
      'folders/folder-1'
    );
  });

  it('links to the folder when the user is a moderator of that folder', async () => {
    mockAuthUserRoles = [
      { type: 'project_folder_moderator', project_folder_id: 'folder-1' },
    ];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink()).toHaveAttribute(
      'href',
      expect.stringContaining('/admin/projects/folders/folder-1')
    );
  });

  it('links to the folder when the user is an admin', async () => {
    mockAuthUserRoles = [{ type: 'admin' }];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink()).toHaveAttribute(
      'href',
      expect.stringContaining('/admin/projects/folders/folder-1')
    );
  });

  it("links to the folder when the user is a space moderator of the folder's space", async () => {
    mockAuthUserRoles = [{ type: 'space_moderator', space_id: 'space-1' }];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink()).toHaveAttribute(
      'href',
      expect.stringContaining('/admin/projects/folders/folder-1')
    );
  });

  it('does not link to the folder for a space moderator of a different space', async () => {
    mockAuthUserRoles = [{ type: 'space_moderator', space_id: 'other-space' }];
    renderRow();

    await userEvent.hover(screen.getByText('Test folder'));

    expect(findRowLink().getAttribute('href')).not.toContain(
      'folders/folder-1'
    );
  });
});
