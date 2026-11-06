import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import DraftPreview from '.';

jest.mock('api/projects/useProjectById');
jest.mock('api/areas/useAreas', () => () => ({ data: undefined }));
jest.mock('api/global_topics/useGlobalTopics', () => () => ({
  data: undefined,
}));
jest.mock('api/groups/useGroups', () => () => ({ data: undefined }));
jest.mock('api/project_groups/useProjectGroups', () => () => ({
  data: undefined,
}));

describe('DraftPreview', () => {
  it('shows a draft that was set up without the assistant', () => {
    render(
      <DraftPreview
        projectId="project-1"
        isNewProject={false}
        onOpenProject={jest.fn()}
      />
    );

    expect(
      screen.getByText('Choose where to plant the tree')
    ).toBeInTheDocument();
    // Without a conversation there is nothing to approve or refine.
    expect(
      screen.queryByRole('button', { name: 'Refine' })
    ).not.toBeInTheDocument();
  });

  it('waits for the setup of a new project, whose title is a placeholder', () => {
    render(
      <DraftPreview
        projectId="project-1"
        isNewProject
        onOpenProject={jest.fn()}
      />
    );

    expect(
      screen.queryByText('Choose where to plant the tree')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('The assistant drafts the project card first.')
    ).toBeInTheDocument();
  });
});
