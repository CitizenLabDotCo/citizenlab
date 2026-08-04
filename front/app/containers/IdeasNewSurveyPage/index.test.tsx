import React from 'react';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { render, screen } from 'utils/testUtils/rtl';

import IdeasNewSurveyPage from '.';

const mockTriggerAuthenticationFlow = jest.fn();
jest.mock('containers/Authentication/events', () => ({
  triggerAuthenticationFlow: (...args: unknown[]) =>
    mockTriggerAuthenticationFlow(...args),
}));

jest.mock('./IdeasNewSurveyForm', () => ({
  __esModule: true,
  default: () => <div data-testid="surveyForm" />,
}));

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ slug: 'a-project' }),
  useSearch: () => ({}),
}));

jest.mock('api/me/useAuthUser', () => jest.fn(() => ({ data: undefined })));

const project = {
  id: 'project-id',
  attributes: { slug: 'a-project' },
  relationships: { current_phase: { data: { id: 'phase-id' } } },
} as unknown as IProjectData;

jest.mock('api/projects/useProjectBySlug', () =>
  jest.fn(() => ({
    data: { data: project },
    status: 'success',
    error: null,
  }))
);

let mockParticipationMethod: ParticipationMethod = 'native_survey';

// Phases with no submission action report posting_not_supported, since no
// Permission record exists for it (see Permission::ACTIONS in the back-end).
const postingDescriptor = () =>
  mockParticipationMethod === 'native_survey'
    ? { enabled: true, disabled_reason: null }
    : { enabled: false, disabled_reason: 'posting_not_supported' };

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: {
      data: {
        id: 'phase-id',
        attributes: {
          participation_method: mockParticipationMethod,
          submission_enabled: true,
          action_descriptors: { posting_idea: postingDescriptor() },
        },
      } as unknown as IPhaseData,
    },
    isInitialLoading: false,
  }))
);

describe('IdeasNewSurveyPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the survey form for a native survey phase', () => {
    mockParticipationMethod = 'native_survey';

    render(<IdeasNewSurveyPage />);

    expect(screen.getByTestId('surveyForm')).toBeInTheDocument();
  });

  // A stale link to a phase that has since become something else. Asking for a
  // posting_idea permission on such a phase 404s, so we must not offer the
  // authentication flow here.
  it('shows the not-active notice for a phase that is not a survey', () => {
    mockParticipationMethod = 'information';

    render(<IdeasNewSurveyPage />);

    expect(screen.queryByTestId('surveyForm')).not.toBeInTheDocument();
    expect(
      screen.getByText('This survey is not currently active.')
    ).toBeInTheDocument();
    expect(mockTriggerAuthenticationFlow).not.toHaveBeenCalled();
  });
});
