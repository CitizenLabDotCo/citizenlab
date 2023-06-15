import React from 'react';
import NonSortableFolderRow, { Props } from './NonSortableFolderRow';
import { render, screen } from 'utils/testUtils/rtl';

import { IAdminPublicationData } from 'api/admin_publications/types';
import { mockFolderChildAdminPublicationsList } from 'api/admin_publications/__mocks__/useAdminPublications';
import { mockAuthUserData } from 'api/me/__mocks__/useAuthUser';
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

const mockFolderChildAdminPublications = {
  hasNextPage: false,
  isLoadingInitial: false,
  isFetchingNextPage: false,
  data: { pages: [{ data: mockFolderChildAdminPublicationsList }] },
};

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

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
    expect(projectRows.length).toEqual(2);
  });
});
