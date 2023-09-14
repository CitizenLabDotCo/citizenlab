import React from 'react';
import ProjectFolderRow, { Props } from '.';
import { render, screen } from 'utils/testUtils/rtl';
import { IUserData } from 'api/users/types';
import { IAdminPublicationData } from 'api/admin_publications/types';

const folderId = 'folderId';

const folderPublication: IAdminPublicationData = {
  id: '1',
  type: 'admin_publication',
  attributes: {
    ordering: 0,
    depth: 0,
    publication_status: 'published',
    visible_children_count: 0,
    publication_title_multiloc: {},
    publication_description_multiloc: {},
    publication_description_preview_multiloc: {},
    publication_slug: 'folder_1',
    followers_count: 3,
  },
  relationships: {
    children: { data: [] },
    parent: {},
    publication: {
      data: {
        id: folderId,
        type: 'folder',
      },
    },
    user_follower: {
      data: null,
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
jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockUserData },
}));
const props: Props = {
  publication: folderPublication,
  toggleFolder: jest.fn,
  isFolderOpen: true,
  hasProjects: true,
};

describe('ProjectFolderRow', () => {
  describe('When user is an admin', () => {
    it('shows the edit button', () => {
      render(<ProjectFolderRow {...props} />);

      const editButton = screen.getByTestId('folder-row-edit-button');
      expect(editButton).toBeInTheDocument();
    });

    it('shows the MoreActionsMenu', () => {
      render(<ProjectFolderRow {...props} />);

      const moreActionsMenu = screen.getByTestId('folderMoreActionsMenu');
      expect(moreActionsMenu).toBeInTheDocument();
    });
  });

  describe('When user is a folder moderator of the folder', () => {
    it('shows the edit button', () => {
      mockUserData.attributes.roles = [
        {
          type: 'project_folder_moderator',
          project_folder_id:
            folderPublication.relationships.publication.data.id,
        },
      ];

      render(<ProjectFolderRow {...props} />);
      const editButton = screen.getByTestId('folder-row-edit-button');
      expect(editButton).toBeInTheDocument();
    });

    it('doest not show the MoreActionsMenu', () => {
      render(<ProjectFolderRow {...props} />);

      const moreActionsMenu = screen.queryByTestId('folderMoreActionsMenu');
      expect(moreActionsMenu).not.toBeInTheDocument();
    });
  });

  describe('When user is a folder moderator but not of the folder', () => {
    it('shows a disabled edit button', async () => {
      mockUserData.attributes.roles = [
        { type: 'project_folder_moderator', project_folder_id: 'testId' },
      ];
      render(<ProjectFolderRow {...props} />);

      const editButton = screen.getByTestId('folder-row-edit-button');
      expect(editButton).toHaveAttribute('disabled');
    });

    it('does not show the MoreActionsMenu', () => {
      mockUserData.attributes.roles = [
        {
          type: 'project_folder_moderator',
          project_folder_id:
            folderPublication.relationships.publication.data.id,
        },
      ];
      render(<ProjectFolderRow {...props} />);

      const moreOptions = screen.queryByTestId('moreOptionsButton');
      expect(moreOptions).not.toBeInTheDocument();
    });
  });
});
