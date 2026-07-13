import React from 'react';

import { screen, render, userEvent, waitFor } from 'utils/testUtils/rtl';

import ProjectFolderForm from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

const mockUpdateProjectFolder = jest.fn();

// A folder created through this form: the description is only ever authored in
// the Content Builder, so description_multiloc comes back null.
const folderWithoutDescription = {
  data: {
    id: 'folder-id',
    attributes: {
      title_multiloc: { en: 'A folder' },
      description_multiloc: null,
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

      // Editing a field enables the Save button.
      const titleInput = await screen.findByDisplayValue('A folder');
      await userEvent.type(titleInput, '!');

      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockUpdateProjectFolder).toHaveBeenCalled();
      });
    });
  });

  describe('when creating a folder (new mode)', () => {
    it('does not render a description editor — the description is added in the Content Builder after creation', () => {
      render(<ProjectFolderForm mode="new" />);

      // No inline WYSIWYG editor and no Content Builder link at creation time:
      // the folder is created first, then its description is authored in the
      // Content Builder.
      expect(
        screen.queryByText('Edit description in Content Builder')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('descriptionBuilderLink')
      ).not.toBeInTheDocument();
    });

    it('still renders the folder title field', () => {
      render(<ProjectFolderForm mode="new" />);

      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });
  });
});
