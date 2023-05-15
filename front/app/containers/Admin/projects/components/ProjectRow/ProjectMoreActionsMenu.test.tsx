import React from 'react';
import ProjectMoreActionsMenu, { Props } from './ProjectMoreActionsMenu';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import { IUserData } from 'services/users';

const defaultProps: Props = {
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

const mockProject = {
  id: defaultProps.projectId,
  type: 'project',
  attributes: {
    folder_id: 'folderId',
  },
};

jest.mock('hooks/useAuthUser', () => {
  return () => mockUserData;
});

jest.mock('api/projects/useProjectById', () => {
  return jest.fn(() => ({ data: { data: mockProject } }));
});

jest.mock('services/projects', () =>
  jest.fn(() => {
    return {
      copyProject: jest.fn().mockImplementation(() => Promise.reject()),
      deleteProject: jest.fn().mockImplementation(() => Promise.reject()),
    };
  })
);

describe('ProjectMoreActionsMenu', () => {
  it('calls setError with an error when copying fails', async () => {
    const setErrorFn = jest.fn();
    const props: Props = {
      projectId: 'projectId',
      setError: setErrorFn,
    };
    render(<ProjectMoreActionsMenu {...props} />);
    const user = userEvent.setup();

    const threeDotsButton = screen.getByTestId('moreOptionsButton');
    await user.click(threeDotsButton);

    const copyProjectButton = await screen.findByRole('button', {
      name: 'Copy project',
    });

    await user.click(copyProjectButton);

    expect(setErrorFn).toHaveBeenLastCalledWith(
      'There was an error copying this project, please try again later.'
    );
  });

  it('calls setError with an error when deleting fails', async () => {
    const setErrorFn = jest.fn();
    defaultProps.setError = setErrorFn;
    render(<ProjectMoreActionsMenu {...defaultProps} />);
    const user = userEvent.setup();

    const threeDotsButton = screen.getByTestId('moreOptionsButton');
    await user.click(threeDotsButton);

    const deleteProjectButton = await screen.findByRole('button', {
      name: 'Delete project',
    });

    expect(deleteProjectButton).toBeInTheDocument();

    await user.click(deleteProjectButton);

    expect(setErrorFn).toHaveBeenLastCalledWith(
      'There was an error deleting this project, please try again later.'
    );
  });

  describe('When user is an admin', () => {
    it('Has the buttons to copy and delete projects', async () => {
      render(<ProjectMoreActionsMenu {...defaultProps} />);
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

  describe('When user is a folder moderator', () => {
    describe('project that is inside folder that user moderates', () => {
      it('Has a button to copy but not delete a project', async () => {
        mockUserData.attributes.roles = [
          {
            type: 'project_folder_moderator',
            project_folder_id: mockProject.attributes.folder_id,
          },
        ];
        render(<ProjectMoreActionsMenu {...defaultProps} />);
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
        expect(deleteProjectButton).not.toBeInTheDocument();
      });
    });

    describe('project that is not inside folder that user moderates', () => {
      it('Has no button to copy nor delete the project', async () => {
        mockUserData.attributes.roles = [
          {
            type: 'project_folder_moderator',
            project_folder_id: 'aDifferentFolderId',
          },
        ];
        render(<ProjectMoreActionsMenu {...defaultProps} />);
        const threeDotsButton = screen.queryByTestId('moreOptionsButton');

        expect(threeDotsButton).not.toBeInTheDocument();
      });
    });
  });

  describe('When user is a project moderator', () => {
    describe('project that user moderates', () => {
      it('Has no button to copy nor delete the project', async () => {
        mockUserData.attributes.roles = [
          {
            type: 'project_moderator',
            project_id: mockProject.id,
          },
        ];
        render(<ProjectMoreActionsMenu {...defaultProps} />);
        const threeDotsButton = screen.queryByTestId('moreOptionsButton');

        expect(threeDotsButton).not.toBeInTheDocument();
      });
    });

    describe('project that user does not moderate', () => {
      it('Has no button to copy nor delete the project', async () => {
        mockUserData.attributes.roles = [
          {
            type: 'project_moderator',
            project_id: 'aDifferentProjectId',
          },
        ];
        render(<ProjectMoreActionsMenu {...defaultProps} />);
        const threeDotsButton = screen.queryByTestId('moreOptionsButton');

        expect(threeDotsButton).not.toBeInTheDocument();
      });
    });
  });
});
