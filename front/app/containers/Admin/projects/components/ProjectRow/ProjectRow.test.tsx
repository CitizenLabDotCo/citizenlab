import React from 'react';
import ProjectRow, { Props } from '.';
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
  actions: ['manage' as const],
  publication,
};

describe('ProjectRow', () => {
  it('shows the edit button', () => {
    render(<ProjectRow {...props} />);

    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeInTheDocument();
  });

  it('shows the MoreActionsMenu when it is enabled', () => {
    render(<ProjectRow {...props} showMoreActions={true} />);

    const moreActionsMenu = screen.getByTestId('moreProjectActionsMenu');
    expect(moreActionsMenu).toBeInTheDocument();
  });
});
