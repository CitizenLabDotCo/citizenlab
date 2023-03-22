import React from 'react';
import ModeratorListRow from './ModeratorListRow';
import { render, screen } from 'utils/testUtils/rtl';
import { IUserData } from 'services/users';

const moderator: IUserData = {
  id: 'moderatorId',
  type: 'user' as const,
  attributes: {
    first_name: 'Johnny',
    last_name: 'Goode',
    invite_status: 'accepted',
    slug: 'test-citizenlab',
    locale: 'en',
    highest_role: 'project_moderator',
    bio_multiloc: {},
    registration_completed_at: '2018-11-26T15:40:54.355Z',
    created_at: '2018-11-26T15:41:19.782Z',
    updated_at: '2018-11-26T15:41:19.782Z',
    email: 'johnny@citizenlab.co',
    confirmation_required: false,
    unread_notifications: 0,
  },
};

describe('<ModeratorListRow />', () => {
  it('disables the delete button if the user is not an admin', () => {
    render(
      <ModeratorListRow
        isLastItem={false}
        projectId="projectId"
        moderator={moderator}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('shows an enabled delete button when user is an admin', () => {
    moderator.attributes.highest_role = 'admin';

    render(
      <ModeratorListRow
        isLastItem={false}
        projectId="projectId"
        moderator={moderator}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });
});
