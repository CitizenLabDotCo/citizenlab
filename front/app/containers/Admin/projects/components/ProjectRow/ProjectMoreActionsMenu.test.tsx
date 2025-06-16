import React from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { IUserData } from 'api/users/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import ProjectMoreActionsMenu, { Props } from './ProjectMoreActionsMenu';

const defaultProps: Props = {
  projectId: 'projectId',
  firstPublishedAt: '2019-05-11T17:04:13.090Z',
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

const mockProject = {
  id: defaultProps.projectId,
  type: 'project',
  attributes: {
    folder_id: 'folderId',
    first_published_at: '2019-05-11T17:04:13.090Z',
  },
};

jest.mock('api/me/useAuthUser', () => () => ({ data: { data: mockUserData } }));

const copyApiPath = '*projects/:projectId/copy';
const deleteApiPath = '*projects/:id';

const server = setupServer(
  http.post(copyApiPath, () => {
    return HttpResponse.json(null, { status: 500 });
  }),
  http.delete(deleteApiPath, () => {
    return HttpResponse.json(null, { status: 500 });
  })
);

describe('ProjectMoreActionsMenu', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('calls setError with an error when copying fails', async () => {
    const setErrorFn = jest.fn();
    const props: Props = {
      projectId: 'projectId',
      firstPublishedAt: '2019-05-11T17:04:13.090Z',
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

    await waitFor(() => {
      expect(setErrorFn).toHaveBeenLastCalledWith(
        'There was an error copying this project, please try again later.'
      );
    });
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

    await waitFor(() => {
      expect(setErrorFn).toHaveBeenLastCalledWith(
        'There was an error deleting this project, please try again later.'
      );
    });
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
        render(
          <ProjectMoreActionsMenu
            {...defaultProps}
            folderId={mockProject.attributes.folder_id}
          />
        );
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
      it('Has not have button to copy nor delete the project', async () => {
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
      it('Has button to copy and delete the project', async () => {
        mockUserData.attributes.roles = [
          {
            type: 'project_moderator',
            project_id: mockProject.id,
          },
        ];
        render(<ProjectMoreActionsMenu {...defaultProps} />);
        const threeDotsButton = screen.queryByTestId('moreOptionsButton');

        expect(threeDotsButton).toBeInTheDocument();
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
