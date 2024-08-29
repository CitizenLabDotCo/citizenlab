import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectCard from '.';

// mock
jest.mock('api/projects/useProjectById');

describe('ProjectCard', () => {
  it('shows the title', () => {
    render(<ProjectCard projectId="projectId" size="large" />);

    expect(screen.getByTestId('project-card-project-title')).toBeVisible();
  });

  it('shows the description', () => {
    render(<ProjectCard projectId="projectId" size="large" />);

    expect(
      screen.getByTestId('project-card-project-description-preview')
    ).toBeVisible();
  });
});
