import React from 'react';

import { NewProjectValues } from 'containers/Admin/projects/_shared/components/NewProjectForm';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import NewProjectModal from './NewProjectModal';

let mockGroupIds: string[] = [];
let mockFailingGroupIds: string[] = [];

const mockAddProject = jest.fn(() =>
  Promise.resolve({ data: { id: 'project-1' } })
);
jest.mock('api/projects/useAddProject', () => () => ({
  mutateAsync: mockAddProject,
}));

const mockAddProjectGroup = jest.fn(({ groupId }: { groupId: string }) =>
  mockFailingGroupIds.includes(groupId)
    ? Promise.reject(new Error('failed'))
    : Promise.resolve({})
);
jest.mock('api/project_groups/useAddProjectGroup', () => () => ({
  mutateAsync: mockAddProjectGroup,
}));

// Stub the form so the test drives the submit directly with chosen groups.
jest.mock(
  'containers/Admin/projects/_shared/components/NewProjectForm',
  () =>
    ({ onSubmit }: { onSubmit: (values: NewProjectValues) => void }) =>
      (
        <button
          onClick={() =>
            onSubmit({
              title_multiloc: { en: 'New project' },
              listed: true,
              visible_to: 'groups',
              groupIds: mockGroupIds,
              space_id: null,
              folder_id: null,
            })
          }
        >
          Submit
        </button>
      )
);

jest.mock('components/Outlet', () => () => null);

const mockPush = jest.fn();
jest.mock('utils/cl-router/history', () => ({
  push: (...args: unknown[]) => mockPush(...args),
}));

const submit = async () => {
  render(<NewProjectModal mode="scratch" onClose={jest.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFailingGroupIds = [];
  const portal = document.createElement('div');
  portal.id = 'modal-portal';
  document.body.appendChild(portal);
});

afterEach(() => {
  document.getElementById('modal-portal')?.remove();
});

describe('NewProjectModal', () => {
  it('opens the project when every group is added', async () => {
    mockGroupIds = ['group-1', 'group-2'];

    await submit();

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        adminProjectsProjectPath('project-1')
      )
    );
    expect(mockAddProjectGroup).toHaveBeenCalledTimes(2);
  });

  it('reports only the groups that failed', async () => {
    mockGroupIds = ['group-1', 'group-2', 'group-3'];
    mockFailingGroupIds = ['group-2'];

    await submit();

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        '/admin/projects/project-1/project-page?groups_failed=group-2'
      )
    );
    expect(mockAddProjectGroup).toHaveBeenCalledTimes(3);
  });

  it('does not try to add groups when the project fails', async () => {
    mockGroupIds = ['group-1'];
    mockAddProject.mockRejectedValueOnce(new Error('failed'));

    await submit();

    await waitFor(() => expect(mockAddProject).toHaveBeenCalled());
    expect(mockAddProjectGroup).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
