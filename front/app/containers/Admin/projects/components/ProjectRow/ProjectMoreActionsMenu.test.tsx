import React from 'react';
import ProjectMoreActionsMenu, { Props } from './ProjectMoreActionsMenu';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import { IUserData } from 'services/users';

const props: Props = {
  projectId: 'projectId',
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
  },
};
jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});

describe('ProjectMoreActionsMenu', () => {
  describe('When user is an admin', () => {
    it('Has the buttons to copy and delete projects', async () => {
      render(<ProjectMoreActionsMenu {...props} />);
      const user = userEvent.setup();

      const threeDotsButton = screen.getByTestId('moreOptionsButton');
      await user.click(threeDotsButton);

      const copyProjectButton = await screen.findByRole('button', {
        name: 'Copy project',
      });
      const deleteProjectButton = await screen.findByRole('button', {
        name: 'Delete project',
      });

      expect(copyProjectButton).toBeInTheDocument();
      expect(deleteProjectButton).toBeInTheDocument();
    });
  });

  describe('When user is a project moderator', () => {
    beforeAll(() => {
      mockUserData.attributes.roles = [
        { type: 'project_moderator', project_id: props.projectId },
      ];
    });

    it('Has the copy button but not the delete button', async () => {
      render(<ProjectMoreActionsMenu {...props} />);
      const user = userEvent.setup();

      const threeDotsButton = screen.getByTestId('moreOptionsButton');
      await user.click(threeDotsButton);

      const copyProjectButton = await screen.findByRole('button', {
        name: 'Copy project',
      });
      const deleteProjectButton = screen.queryByRole('button', {
        name: 'Delete project',
      });

      expect(copyProjectButton).toBeInTheDocument();
      expect(deleteProjectButton).toBeNull();
    });
  });

  // describe('When user is a folder moderator', () => {
  //   beforeAll(() => {
  //     mockUserData.attributes.roles = [
  //       { type: 'project_folder_moderator', project_folder_id: 'folderId' },
  //     ];
  //   });

  //   it('Has no copy nor delete button', async () => {
  //     render(<ProjectMoreActionsMenu {...props} />);
  //     const user = userEvent.setup();

  //     const threeDotsButton = screen.getByTestId('moreOptionsButton');
  //     await user.click(threeDotsButton);

  //     const copyProjectButton = screen.queryByRole('button', {
  //       name: 'Copy project',
  //     });
  //     const deleteProjectButton = screen.queryByRole('button', {
  //       name: 'Delete project',
  //     });

  //     expect(copyProjectButton).toBeNull();
  //     expect(deleteProjectButton).toBeNull();
  //   });
  // });
});
