import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import LargeProjectCard from './LargeProjectCard';
import MediumProjectCard from './MediumProjectCard';
import SmallProjectCard from './SmallProjectCard';

// mock
jest.mock('api/projects/useProjectById');

describe('LargeProjectCard', () => {
  it('shows the title', () => {
    render(<LargeProjectCard projectId="projectId" />);

    expect(screen.getByTestId('project-card-project-title')).toBeVisible();
  });

  it('shows the description', () => {
    render(<LargeProjectCard projectId="projectId" />);

    expect(
      screen.getByTestId('project-card-project-description-preview')
    ).toBeVisible();
  });
});

describe('MediumProjectCard', () => {
  it('shows the title', () => {
    render(<MediumProjectCard projectId="projectId" />);

    expect(screen.getByTestId('project-card-project-title')).toBeVisible();
  });

  it('shows the description', () => {
    render(<MediumProjectCard projectId="projectId" />);

    expect(
      screen.getByTestId('project-card-project-description-preview')
    ).toBeVisible();
  });
});

describe('SmallProjectCard', () => {
  it('shows the title', () => {
    render(<SmallProjectCard projectId="projectId" />);

    expect(screen.getByTestId('project-card-project-title')).toBeVisible();
  });

  it('shows the description', () => {
    render(<SmallProjectCard projectId="projectId" />);

    expect(
      screen.getByTestId('project-card-project-description-preview')
    ).toBeVisible();
  });
});
