// @ts-nocheck
import React from 'react';

// services & hooks
import { getProject } from 'services/__mocks__/projects';
import { mockQuestion } from 'services/__mocks__/pollQuestions';
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import { mockPhasePollData } from 'services/__mocks__/phases';

// utils
import { render, screen } from 'utils/testUtils/rtl';

// components
import { Poll } from './index';

// Mocks
const mockProject = getProject('projectId', 'continuous', 'poll');
const mockPollQuestions = [
  'How are you today?',
  'What is on the menu for dinner tonight?',
  "What's your favourite ice cream flavor?",
].map((item, index) => mockQuestion(index, item));

jest.mock('hooks/useResourceFiles', () => jest.fn(() => []));
jest.mock('hooks/useProject', () => jest.fn(() => mockProject));
jest.mock('hooks/usePhase', () => jest.fn(() => mockPhasePollData));
jest.mock('components/UI/Warning', () => 'Warning');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

const warningIdPrefix = 'app.containers.Projects.PollForm.';

describe('<Poll/>', () => {
  it('renders null when project is null', () => {
    useProject.mockReturnValue(null);
    render(
      <Poll
        type="project"
        projectId="projectId"
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when project is undefined', () => {
    useProject.mockReturnValue(undefined);
    render(
      <Poll
        type="project"
        projectId="projectId"
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when project is error', () => {
    useProject.mockReturnValue(new Error());
    render(
      <Poll
        type="project"
        projectId="projectId"
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when pollQuestions is null', () => {
    useProject.mockReturnValue(mockProject);
    render(<Poll type="project" projectId="projectId" pollQuestions={null} />);
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when pollQuestions is undefined', () => {
    useProject.mockReturnValue(mockProject);
    render(
      <Poll type="project" projectId="projectId" pollQuestions={undefined} />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when pollQuestions is error', () => {
    useProject.mockReturnValue(mockProject);
    render(
      <Poll type="project" projectId="projectId" pollQuestions={new Error()} />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when type is phase and phase is null', () => {
    useProject.mockReturnValue(mockProject);
    usePhase.mockReturnValue(null);
    render(
      <Poll
        type="phase"
        projectId="projectId"
        phase={null}
        pollQuestions={new Error()}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when type is phase and phase is undefined', () => {
    useProject.mockReturnValue(mockProject);
    usePhase.mockReturnValue(undefined);
    render(
      <Poll
        type="phase"
        projectId="projectId"
        phase={null}
        pollQuestions={new Error()}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });

  it('renders null when type is phase and phase is error', () => {
    useProject.mockReturnValue(mockProject);
    usePhase.mockReturnValue(new Error());
    render(
      <Poll
        type="phase"
        projectId="projectId"
        phase={null}
        pollQuestions={new Error()}
      />
    );
    expect(screen.queryByTestId('poll-container')).not.toBeInTheDocument();
  });
});

describe('permissions', () => {
  it('shows maybe permitted if user is not logged in', async () => {
    useProject.mockReturnValue({
      ...mockProject,
      attributes: {
        action_descriptor: {
          taking_poll: {
            enabled: false,
            disabled_reason: 'not_signed_in',
          },
        },
      },
    });

    await render(
      <Poll
        type="project"
        phaseId={null}
        projectId="projectId"
        authUser={null}
        phase={null}
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.getByTestId('poll-styled-warning')).toBeInTheDocument();
    const formattedMessage = screen.getByTestId('poll-styled-warning')
      .children[0];
    expect(formattedMessage.getAttribute('id')).toBe(
      `${warningIdPrefix}pollDisabledMaybeNotPermitted`
    );
  });

  it('is enabled if user can anwser', async () => {
    useProject.mockReturnValue({
      ...mockProject,
      attributes: {
        action_descriptor: {
          taking_poll: {
            enabled: true,
          },
        },
      },
    });

    await render(
      <Poll
        type="project"
        phaseId={null}
        projectId="projectId"
        authUser={null}
        phase={null}
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.queryByTestId('poll-styled-warning')).not.toBeInTheDocument();
  });

  it('shows already responded if user already responded', async () => {
    useProject.mockReturnValue({
      ...mockProject,
      attributes: {
        action_descriptor: {
          taking_poll: {
            enabled: false,
            disabled_reason: 'already_responded',
          },
        },
      },
    });

    await render(
      <Poll
        type="project"
        phaseId={null}
        projectId="projectId"
        authUser={null}
        phase={null}
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.queryByTestId('form-completed')).toBeInTheDocument();
  });

  it('shows a matching explicative message if the phase is not active', async () => {
    useProject.mockReturnValue({
      ...mockProject,
      attributes: {
        action_descriptor: {
          taking_poll: {
            enabled: false,
            disabled_reason: 'phase_not_active',
          },
        },
      },
    });
    usePhase.mockReturnValue({
      ...mockPhasePollData,
      attributes: { start_at: '2019-05-10', end_at: '2019-05-30' },
    });

    await render(
      <Poll
        type="phase"
        phaseId={'phaseId'}
        projectId="projectId"
        authUser={null}
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.getByTestId('poll-styled-warning')).toBeInTheDocument();
    const formattedMessage = screen.getByTestId('poll-styled-warning')
      .children[0];
    expect(formattedMessage.getAttribute('id')).toBe(
      `${warningIdPrefix}pollDisabledNotPossible`
    );
  });

  it('shows a matching explicative message if the project is not active', async () => {
    useProject.mockReturnValue({
      ...mockProject,
      attributes: {
        action_descriptor: {
          taking_poll: {
            enabled: false,
            disabled_reason: 'project_inactive',
          },
        },
      },
    });

    await render(
      <Poll
        type="project"
        projectId="projectId"
        authUser={null}
        pollQuestions={mockPollQuestions}
      />
    );
    expect(screen.getByTestId('poll-styled-warning')).toBeInTheDocument();
    const formattedMessage = screen.getByTestId('poll-styled-warning')
      .children[0];
    expect(formattedMessage.getAttribute('id')).toBe(
      `${warningIdPrefix}pollDisabledProjectInactive`
    );
  });
});
