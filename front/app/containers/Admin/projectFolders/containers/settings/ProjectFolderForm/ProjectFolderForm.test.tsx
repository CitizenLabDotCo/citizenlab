import React from 'react';

import { screen, render, userEvent, waitFor } from 'utils/testUtils/rtl';

import ProjectFolderForm from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

const mockUpdateProjectFolder = jest.fn();

const folderWithoutDescription = {
  data: {
    id: 'folder-id',
    attributes: {
      title_multiloc: { en: 'A folder' },
      description_preview_multiloc: { en: 'Short description' },
      header_bg_alt_text_multiloc: {},
      slug: 'a-folder',
      space_id: null,
    },
    relationships: {
      admin_publication: { data: { id: 'admin-publication-id' } },
    },
  },
};

jest.mock('api/project_folders/useProjectFolderById', () =>
  jest.fn((id?: string) => ({
    data: id ? folderWithoutDescription : undefined,
  }))
);
jest.mock('api/project_folders/useUpdateProjectFolder', () =>
  jest.fn(() => ({ mutateAsync: mockUpdateProjectFolder }))
);
jest.mock('api/project_folder_images/useProjectFolderImages', () =>
  jest.fn(() => ({ data: undefined }))
);
jest.mock('api/project_folder_files/useProjectFolderFiles', () =>
  jest.fn(() => ({ data: undefined }))
);
jest.mock('api/admin_publications/useAdminPublication', () =>
  jest.fn(() => ({ data: undefined }))
);

describe('ProjectFolderForm', () => {
  beforeEach(() => {
    mockUpdateProjectFolder.mockClear();
  });

  describe('when editing a folder with no description (edit mode)', () => {
    it('saves — the description is optional, so it must not block the save', async () => {
      render(<ProjectFolderForm mode="edit" projectFolderId="folder-id" />);

      const titleInput = await screen.findByDisplayValue('A folder');
      await userEvent.type(titleInput, '!');

      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockUpdateProjectFolder).toHaveBeenCalled();
      });
    });
  });

  describe('when creating a folder (new mode)', () => {
    it('renders the folder title field', () => {
      render(<ProjectFolderForm mode="new" />);

      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });
  });
});
