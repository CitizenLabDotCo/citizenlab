import React from 'react';

import { mockFolderChildAdminPublicationsList } from 'api/admin_publications/__mocks__/useAdminPublications';
import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';

import dragAndDrop from 'utils/testUtils/dragAndDrop';
import { render, screen } from 'utils/testUtils/rtl';

import ItemsInFolder, { Props } from './ItemsInFolder';

jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockAuthUserData },
}));

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
  projectFolderId: 'projectFolderId',
};

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
    uses_content_builder: true,
  },
};

jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);

describe('ItemsInFolder', () => {
  it('Changes the order of projects', () => {
    render(<ItemsInFolder {...props} />);

    const projectRows = screen.getAllByTestId('projectRow');

    const firstRow = projectRows[0];
    const secondRow = projectRows[1];

    dragAndDrop(secondRow, firstRow);

    // Fetch rows again
    const reorderQuestionRows = screen.getAllByTestId('projectRow');

    expect(reorderQuestionRows[0]).toEqual(secondRow);
  });
});
