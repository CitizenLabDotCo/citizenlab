import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';

import { render, screen } from 'utils/testUtils/rtl';

import DraftPreview from '.';

const savedPhase: IPhaseData = {
  ...phasesData[0],
  attributes: {
    ...phasesData[0].attributes,
    title_multiloc: { en: 'Collect ideas for the square' },
    start_at: '2026-11-02',
    end_at: '2026-11-30',
  },
};

let mockPhases: IPhaseData[] = [];

jest.mock('api/projects/useProjectById');
jest.mock('api/phases/usePhases', () => () => ({
  data: { data: mockPhases },
}));
jest.mock('api/events/useEvents', () => () => ({ data: { data: [] } }));
jest.mock('api/phase_permissions/usePhasePermissions', () => () => ({
  data: undefined,
}));
jest.mock('api/areas/useAreas', () => () => ({ data: undefined }));
jest.mock('api/global_topics/useGlobalTopics', () => () => ({
  data: undefined,
}));
jest.mock('api/groups/useGroups', () => () => ({ data: undefined }));
jest.mock('api/project_groups/useProjectGroups', () => () => ({
  data: undefined,
}));

describe('DraftPreview', () => {
  beforeEach(() => {
    mockPhases = [];
  });

  it('shows a draft that was set up without the assistant', () => {
    mockPhases = [savedPhase];

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
    expect(
      screen.getByText('Collect ideas for the square')
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
    expect(
      screen.getByText('Phases appear here once the project setup is approved.')
    ).toBeInTheDocument();
  });
});
