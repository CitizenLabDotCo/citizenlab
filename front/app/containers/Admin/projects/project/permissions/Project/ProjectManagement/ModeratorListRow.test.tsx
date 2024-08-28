import React from 'react';

import { IUserData } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import ModeratorListRow from './ModeratorListRow';

const projectId = 'projectId';
const projectModeratorRole = {
  type: 'project_moderator' as const,
  project_id: projectId,
};
const moderator: IUserData = {
  id: 'moderatorId',
  type: 'user' as const,
  attributes: {
    first_name: 'Johnny',
    last_name: 'Goode',
    invite_status: 'accepted',
    slug: 'test-govocal',
    locale: 'en',
    highest_role: 'project_moderator',
    roles: [projectModeratorRole],
    bio_multiloc: {},
    registration_completed_at: '2018-11-26T15:40:54.355Z',
    created_at: '2018-11-26T15:41:19.782Z',
    updated_at: '2018-11-26T15:41:19.782Z',
    email: 'johnny@govocal.com',
    confirmation_required: false,
    unread_notifications: 0,
    followings_count: 2,
  },
};

const mockAuthUserData: IUserData = {
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
    followings_count: 2,
  },
};

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

describe('<ModeratorListRow />', () => {
  it('shows an enabled delete button when user is an admin', () => {
    render(
      <ModeratorListRow
        isLastItem={false}
        projectId={projectId}
        moderator={moderator}
        folderId={null}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeEnabled();
  });

  it('disables the delete button if the user is not an admin', () => {
    mockAuthUserData.attributes.roles = [projectModeratorRole];
    // Changing highest_role is not necessary. isAdmin doesn't check highest_role
    // at the time of writing this test. But adding it for "data correctness".
    mockAuthUserData.attributes.highest_role = 'project_moderator';

    render(
      <ModeratorListRow
        isLastItem={false}
        projectId={projectId}
        moderator={moderator}
        folderId={null}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the delete button if the user moderates the folder containing the project', () => {
    mockAuthUserData.attributes.highest_role = 'project_folder_moderator';
    mockAuthUserData.attributes.roles = [
      projectModeratorRole,
      { type: 'project_folder_moderator', project_folder_id: 'folderId' },
    ];

    render(
      <ModeratorListRow
        isLastItem={false}
        projectId={projectId}
        moderator={moderator}
        folderId="folderId"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
  });
});
