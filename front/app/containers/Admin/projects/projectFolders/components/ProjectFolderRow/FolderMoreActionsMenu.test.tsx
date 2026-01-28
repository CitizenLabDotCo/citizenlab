import React from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { IUserData } from 'api/users/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import FolderMoreActionsMenu, { Props } from './FolderMoreActionsMenu';

const props: Props = {
  folderId: 'folderId',
  setError: jest.fn(),
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
    followings_count: 2,
  },
};
jest.mock('api/me/useAuthUser', () => () => ({
  data: { data: mockUserData },
}));

const projectFolders = {
  data: [
    { id: 'folder1', attributes: { title_multiloc: { en: 'Folder 1' } } },
    { id: 'folder2', attributes: { title_multiloc: { en: 'Folder 2' } } },
  ],
};

jest.mock('api/project_folders/useProjectFolders', () => () => {
  return { data: projectFolders };
});

const apiPath = '*project_folders/:folderId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json({}, { status: 500 });
  })
);

describe('FolderMoreActionsMenu', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('calls setError with an error when deleting fails', async () => {
    const setErrorFn = jest.fn();
    const customProps: Props = {
      folderId: 'folderId',
      setError: setErrorFn,
    };
    render(<FolderMoreActionsMenu {...customProps} />);
    const user = userEvent.setup();

    const threeDotsButton = screen.getByTestId('moreOptionsButton');
    await user.click(threeDotsButton);

    const deleteFolderButton = await screen.findByRole('button', {
      name: 'Delete folder',
    });
    await user.click(deleteFolderButton);

    const confirmationInput = await screen.findByPlaceholderText('DELETE');
    await user.type(confirmationInput, 'DELETE');

    const confirmDeleteButton = await screen.findByRole('button', {
      name: 'Delete folder',
    });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(setErrorFn).toHaveBeenLastCalledWith(
        'There was an issue removing this folder. Please try again.'
      );
    });
  });

  describe('When user is an admin', () => {
    it('Has the folder delete button', async () => {
      render(<FolderMoreActionsMenu {...props} />);
      const user = userEvent.setup();

      const threeDotsButton = screen.getByTestId('moreOptionsButton');
      await user.click(threeDotsButton);

      const deleteFolderButton = await screen.findByRole('button', {
        name: 'Delete folder',
      });
      expect(deleteFolderButton).toBeInTheDocument();
    });
  });

  describe('When user is a project moderator', () => {
    beforeAll(() => {
      mockUserData.attributes.roles = [
        { type: 'project_moderator', project_id: 'projectId' },
      ];
    });

    it('Does not have the more options menu', async () => {
      render(<FolderMoreActionsMenu {...props} />);

      const threeDotsButton = screen.queryByTestId('moreOptionsButton');
      expect(threeDotsButton).toBeNull();
    });
  });

  describe('When user is a folder moderator', () => {
    beforeAll(() => {
      mockUserData.attributes.roles = [
        { type: 'project_folder_moderator', project_folder_id: props.folderId },
      ];
    });

    // To be checked if a folder mod can't do this.
    it('Does not have the more options menu', async () => {
      render(<FolderMoreActionsMenu {...props} />);

      const threeDotsButton = screen.queryByTestId('moreOptionsButton');
      expect(threeDotsButton).toBeNull();
    });
  });
});
