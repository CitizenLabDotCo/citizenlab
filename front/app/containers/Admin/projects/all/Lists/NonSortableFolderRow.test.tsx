import React from 'react';
import NonSortableFolderRow, { Props } from './NonSortableFolderRow';
import { render, screen } from 'utils/testUtils/rtl';
import {
  IAdminPublicationContent,
  IUseAdminPublicationsOutput,
} from 'hooks/useAdminPublications';
import { IUserData } from 'api/users/types';

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
  isLastItem: true,
  id: 'SortableFolderRowId',
};

describe('NonSortableFolderRow', () => {
  it('renders the project row inside', () => {
    render(<NonSortableFolderRow {...props} />);

    const projectRows = screen.getAllByTestId('projectRow');
    expect(projectRows.length).toEqual(1);
  });
});
