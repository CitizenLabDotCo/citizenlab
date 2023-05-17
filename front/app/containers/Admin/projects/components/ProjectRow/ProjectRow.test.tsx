import React from 'react';
import ProjectRow, { Props } from '.';
import { render, screen } from 'utils/testUtils/rtl';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IUserData } from 'api/users/types';

const publication: IAdminPublicationContent = {
  id: '1',
  publicationType: 'project' as const,
  publicationId: 'publicationId',
  attributes: {
    ordering: 0,
    depth: 0,
    publication_status: 'published',
    visible_children_count: 0,
    publication_title_multiloc: {},
    publication_description_multiloc: {},
    publication_description_preview_multiloc: {},
    publication_slug: 'project_1',
  },
  relationships: {
    children: { data: [] },
    parent: {},
    publication: {
      data: {
        id: '1',
        type: 'project',
      },
    },
  },
};

// Needed to render moreActionsMenu
const mockUserData: IUserData = {
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
  },
};

// Needed to render moreActionsMenu
jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});

const props: Props = {
  actions: ['manage' as const],
  publication,
};

describe('ProjectRow', () => {
  it('shows the edit button', () => {
    render(<ProjectRow {...props} />);

    const editButton = screen.getByTestId('project-row-edit-button');
    expect(editButton).toBeInTheDocument();
  });

  it('shows the MoreActionsMenu when it is enabled', () => {
    render(<ProjectRow {...props} />);

    const moreActionsMenu = screen.getByTestId('moreProjectActionsMenu');
    expect(moreActionsMenu).toBeInTheDocument();
  });

  it('does not show the MoreActionsMenu when it is not enabled', () => {
    render(<ProjectRow {...props} hideMoreActions />);

    const moreActionsMenu = screen.queryByTestId('moreProjectActionsMenu');
    expect(moreActionsMenu).toBeNull();
  });

  // TODO: Could use extra tests for different user roles
});
