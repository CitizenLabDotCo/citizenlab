import React from 'react';
import ProjectFolderRow, { Props } from '.';
import { render, screen } from 'utils/testUtils/rtl';
import {
  IAdminPublicationContent,
  IUseAdminPublicationsOutput,
} from 'hooks/useAdminPublications';
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
const mockFolderChildAdminPublicationsList: IAdminPublicationContent[] = [
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
const mockFolderChildAdminPublications: IUseAdminPublicationsOutput = {
  hasMore: false,
  loadingInitial: false,
  loadingMore: false,
  list: mockFolderChildAdminPublicationsList,
  onLoadMore: jest.fn,
  onChangeTopics: jest.fn,
  onChangeSearch: jest.fn,
  onChangeAreas: jest.fn,
  onChangePublicationStatus: jest.fn,
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
jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});

// Needed to render folder with project inside
jest.mock('hooks/useAdminPublications', () => {
  return () => mockFolderChildAdminPublications;
});

const props: Props = {
  publication: folderPublication,
  toggleFolder: jest.fn,
  isFolderOpen: true,
  hasProjects: true,
};

describe('ProjectFolderRow', () => {
  it('renders the project row inside', () => {
    render(<ProjectFolderRow {...props} />);

    const projectRows = screen.getAllByTestId('projectRow');
    expect(projectRows.length).toEqual(1);
  });

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
          project_folder_id: folderPublication.publicationId,
        },
      ];

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
          project_folder_id: folderPublication.publicationId,
        },
      ];
      render(<ProjectFolderRow {...props} />);

      const moreOptions = screen.queryByTestId('moreOptionsButton');
      expect(moreOptions).toBeNull();
    });
  });
});
