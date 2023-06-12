import React from 'react';
import NonSortableFolderRow, { Props } from './NonSortableFolderRow';
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
const mockFolderChildAdminPublicationsList: IAdminPublicationData[] = [
  {
    id: '2',
    type: 'admin_publication',
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

jest.mock('api/me/useAuthUser', () => () => ({ data: { data: mockUserData } }));

const mockFolderChildAdminPublications = {
  hasNextPage: false,
  isLoadingInitial: false,
  isFetchingNextPage: false,
  data: { pages: [{ data: mockFolderChildAdminPublicationsList }] },
};

// Needed to render folder with project inside
jest.mock('api/admin_publications/useAdminPublications', () => {
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
