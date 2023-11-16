import React from 'react';
import ItemsInFolder, { Props } from './ItemsInFolder';
import { render, screen } from 'utils/testUtils/rtl';
import { mockFolderChildAdminPublicationsList } from 'api/admin_publications/__mocks__/useAdminPublications';
import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';
import dragAndDrop from 'utils/testUtils/dragAndDrop';

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
