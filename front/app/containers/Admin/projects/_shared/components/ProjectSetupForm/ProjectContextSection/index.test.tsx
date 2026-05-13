import React from 'react';

import { HighestRole, IUser } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';
import { TRole } from 'utils/permissions/roles';

import ProjectContextSection from '.';
import { Props } from './types';

jest.mock('./Inner', () => () => <div data-testid="project-context-inner" />);

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const buildUser = (highest_role: HighestRole, roles: TRole[]): IUser => ({
  data: {
    id: 'user-1',
    type: 'user',
    attributes: {
      locale: 'en',
      bio_multiloc: {},
      registration_completed_at: '',
      created_at: '',
      updated_at: '',
      unread_notifications: 0,
      invite_status: null,
      confirmation_required: false,
      followings_count: 0,
      highest_role,
      roles,
    },
  },
});

const props: Props & { formSituation: 'creating' } = {
  projectContext: 'root',
  folder_id: null,
  space_id: null,
  error: false,
  onSetContext: jest.fn(),
  onChangeSpace: jest.fn(),
  onChangeFolder: jest.fn(),
  formSituation: 'creating',
};

describe('ProjectContextSection', () => {
  it('renders nothing when there is no authenticated user', () => {
    mockAuthUser = undefined;
    render(<ProjectContextSection {...props} />);
    expect(screen.queryByTestId('project-context-inner')).toBeNull();
  });

  it('hides the section when the user is only a project moderator', () => {
    mockAuthUser = buildUser('project_moderator', [
      { type: 'project_moderator', project_id: 'p-1' },
    ]);
    render(<ProjectContextSection {...props} />);
    expect(screen.queryByTestId('project-context-inner')).toBeNull();
  });

  it('still shows the section when a folder manager is also a project moderator', () => {
    // Regression guard: previously the section was hidden whenever the user
    // had any project_moderator role, so granting a folder manager an extra
    // project-moderator assignment dropped the folder selector from the
    // new-project form.
    mockAuthUser = buildUser('project_folder_moderator', [
      { type: 'project_folder_moderator', project_folder_id: 'f-1' },
      { type: 'project_moderator', project_id: 'p-1' },
    ]);
    render(<ProjectContextSection {...props} />);
    expect(screen.getByTestId('project-context-inner')).toBeInTheDocument();
  });

  it('shows the section for folder managers', () => {
    mockAuthUser = buildUser('project_folder_moderator', [
      { type: 'project_folder_moderator', project_folder_id: 'f-1' },
    ]);
    render(<ProjectContextSection {...props} />);
    expect(screen.getByTestId('project-context-inner')).toBeInTheDocument();
  });

  it('shows the section for space moderators', () => {
    mockAuthUser = buildUser('space_moderator', [
      { type: 'space_moderator', space_id: 's-1' },
    ]);
    render(<ProjectContextSection {...props} />);
    expect(screen.getByTestId('project-context-inner')).toBeInTheDocument();
  });

  it('still shows the section when a space moderator is also a project moderator', () => {
    mockAuthUser = buildUser('space_moderator', [
      { type: 'space_moderator', space_id: 's-1' },
      { type: 'project_moderator', project_id: 'p-1' },
    ]);
    render(<ProjectContextSection {...props} />);
    expect(screen.getByTestId('project-context-inner')).toBeInTheDocument();
  });

  it('shows the section for admins', () => {
    mockAuthUser = buildUser('admin', [{ type: 'admin' }]);
    render(<ProjectContextSection {...props} />);
    expect(screen.getByTestId('project-context-inner')).toBeInTheDocument();
  });
});
