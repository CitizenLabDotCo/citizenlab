import React from 'react';
import ProjectFolderRow, { Props } from '.';
import { render, screen } from 'utils/testUtils/rtl';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const publication: IAdminPublicationContent = {
  id: '1',
  publicationType: 'project' as const,
  publicationId: 'publicationId',
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
    parent: {},
    publication: {
      data: {
        id: '1',
        type: 'project',
      },
    },
  },
};

// Needed to render moreActionsMenu
jest.mock('hooks/useAuthUser', () => {
  return () => ({
    id: 'userId',
  });
});

const props: Props = {
  publication,
};

describe('ProjectFolderRow', () => {
  describe('When user is an admin', () => {
    it('shows the edit button', () => {
      render(<ProjectFolderRow {...props} />);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).toBeInTheDocument();
    });

    it('shows the MoreActionsMenu', () => {
      render(<ProjectFolderRow {...props} />);

      const moreActionsMenu = screen.getByTestId('folderMoreActionsMenu');
      expect(moreActionsMenu).toBeInTheDocument();
    });
  });

  describe('When user is a folder moderator', () => {
    // it('shows the edit button for a folder the user is a moderator of', () => {
    //   render(<ProjectFolderRow {...props} />);

    //   const editButton = screen.getByRole('button', { name: 'Edit' });
    //   expect(editButton).toBeInTheDocument();
    // });

    // it('shows a disabled edit button for a folder the user is not a moderator of', () => {
    //   render(<ProjectFolderRow {...props} />);

    //   const editButton = screen.getByRole('button', { name: 'Edit' });
    //   expect(editButton).toBeDisabled();
    // });

    it('does not show the MoreActionsMenu', () => {
      render(<ProjectFolderRow {...props} />);

      const moreActionsMenu = screen.queryByTestId('folderMoreActionsMenu');
      expect(moreActionsMenu).toBeNull();
    });
  });
});
