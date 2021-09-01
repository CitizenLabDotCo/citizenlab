import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import { makeUser } from 'services/__mocks__/users';
import { getProject } from 'services/__mocks__/projects';
import { IProjectData } from 'services/projects';

import VotingDisabled from './VotingDisabled';
const defaultProps = {
  projectId: 'projectId',
};

let mockProject: IProjectData | null = getProject(
  defaultProps.projectId,
  'continuous',
  'ideation'
);
const mockUser = makeUser();

jest.mock('utils/cl-intl');
jest.mock('hooks/useProject', () => jest.fn(() => mockProject));
jest.mock('hooks/useAuthUser', () => jest.fn(() => mockUser));

describe('VotingDisabled', () => {
  it('renders the component', () => {
    render(
      <VotingDisabled
        {...defaultProps}
        votingDescriptor={{
          enabled: false,
          future_enabled: null,
          disabled_reason: 'not_permitted',
          cancelling_enabled: false,
          downvoting_enabled: true,
        }}
      />
    );
    expect(screen.getByTestId('votingDisabled_Container')).toBeInTheDocument();
  });

  it("doesn't render the component if the project is null", () => {
    mockProject = null;
    render(
      <VotingDisabled
        {...defaultProps}
        votingDescriptor={{
          enabled: false,
          future_enabled: null,
          disabled_reason: 'not_permitted',
          cancelling_enabled: false,
          downvoting_enabled: true,
        }}
      />
    );
    expect(
      screen.queryByTestId('votingDisabled_Container')
    ).not.toBeInTheDocument();
  });
});
