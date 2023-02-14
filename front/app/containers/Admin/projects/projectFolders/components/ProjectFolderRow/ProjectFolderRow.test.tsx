import React from 'react';
import ProjectFolderRow, { Props } from '.';
import { render, screen } from 'utils/testUtils/rtl';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IUserData } from 'services/users';

const folderId = 'folderId';
const folderPublication: IAdminPublicationContent = {
  id: '1',
  publicationType: 'folder' as const,
  publicationId: folderId,
  attributes: {
    ordering: 0,
    depth: 0,
    publication_status: 'published',
    visible_children_count: 0,
    publication_title_multiloc: {},
    publication_description_multiloc: {},
    publication_description_preview_multiloc: {},
    publication_slug: 'folder_1',
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
  },
};

const projectId = 'projectId';
const mockFolderChildAdminPublications: IAdminPublicationContent[] = [
  {
    id: '2',
    publicationType: 'project' as const,
    publicationId: projectId,
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
      parent: {
        data: {
          type: 'folder',
          id: folderPublication.id,
        },
      },
      publication: {
        data: {
          id: projectId,
          type: 'project',
        },
      },
    },
  },
];

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
jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});
jest.mock('hooks/useAdminPublications', () => {
  return () => mockFolderChildAdminPublications;
});

const props: Props = {
  publication: folderPublication,
};

describe('ProjectFolderRow', () => {
  describe('When user is an admin', () => {
    it('shows the edit button', () => {
      render(<ProjectFolderRow {...props} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toBeInTheDocument();
    });

    it('shows the MoreActionsMenu', () => {
      render(<ProjectFolderRow {...props} />);

      const moreActionsMenu = screen.getByTestId('folderMoreActionsMenu');
      expect(moreActionsMenu).toBeInTheDocument();
    });
  });

  describe('When user is a folder moderator', () => {
    it('shows the edit button for a folder the user is a moderator of', () => {
      mockUserData.attributes.roles = [
        {
          type: 'project_folder_moderator',
          project_folder_id: folderPublication.publicationId,
        },
      ];

      render(<ProjectFolderRow {...props} />);
      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toBeInTheDocument();
    });

    it('shows a disabled edit button for a folder when the user is not a moderator of', async () => {
      mockUserData.attributes.roles = [
        { type: 'project_folder_moderator', project_folder_id: 'testId' },
      ];
      render(<ProjectFolderRow {...props} />);

      const editButton = screen.getByTestId('edit-button');
      expect(editButton).toHaveAttribute('disabled');
    });

    it('does not show the MoreActionsMenu', () => {
      mockUserData.attributes.roles = [
        { type: 'project_folder_moderator', project_folder_id: 'folderId' },
      ];

      render(<ProjectFolderRow {...props} />);
      const moreOptions = screen.queryByTestId('moreOptionsButton');
      expect(moreOptions).toBeNull();
    });
  });
});
