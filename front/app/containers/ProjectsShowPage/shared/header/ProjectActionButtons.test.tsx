import React from 'react';

import { addDays, format, subDays } from 'date-fns';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectData } from 'api/projects/types';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectActionButtons from './ProjectActionButtons';

const day = (offset: number) =>
  format(
    offset < 0 ? subDays(new Date(), -offset) : addDays(new Date(), offset),
    'yyyy-MM-dd'
  );

const buildPhase = (
  id: string,
  participationMethod: ParticipationMethod,
  overrides: Partial<IPhaseData['attributes']> = {}
): IPhaseData => ({
  ...phasesData[0],
  id,
  attributes: {
    ...phasesData[0].attributes,
    participation_method: participationMethod,
    start_at: day(-7),
    end_at: day(7),
    ...overrides,
  },
});

const volunteeringPhase = buildPhase('volunteering-phase', 'volunteering');
const spotlightSurvey = (id: string) =>
  buildPhase(id, 'native_survey', { placement_type: 'standalone' });

let mockPublicationStatus: IProjectData['attributes']['publication_status'] =
  'published';
let mockTimelinePhases: IPhaseData[] = [volunteeringPhase];
let mockStandalonePhases: IPhaseData[] = [];

jest.mock('api/me/useAuthUser', () => () => ({ data: undefined }));
jest.mock('api/events/useEvents', () => () => ({ data: { data: [] } }));
jest.mock(
  'components/ProjectPageBuilder/Widgets/Events/useHasEventsWidget',
  () => () => false
);
jest.mock('api/projects/useProjectById', () => () => ({
  data: {
    data: {
      ...project1,
      attributes: {
        ...project1.attributes,
        publication_status: mockPublicationStatus,
      },
    },
  },
}));
jest.mock(
  'api/phases/usePhases',
  () => (_projectId?: string, placement?: string) => ({
    data: {
      data:
        placement === 'standalone' ? mockStandalonePhases : mockTimelinePhases,
    },
  })
);
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useLocation: () => ({ pathname: '/projects/a-project', hash: '' }),
}));
jest.mock(
  'components/ProjectPageBuilder/Widgets/SpotlightSurveys/ActionButton',
  () => () => <button>Spotlight survey</button>
);

describe('ProjectActionButtons — volunteering CTA', () => {
  beforeEach(() => {
    mockPublicationStatus = 'published';
    mockTimelinePhases = [volunteeringPhase];
    mockStandalonePhases = [];
  });

  it('shows the Volunteer button on a published project with an active volunteering phase', () => {
    render(<ProjectActionButtons projectId="projectId" />);
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
  });

  it('hides the Volunteer button on an archived project', () => {
    mockPublicationStatus = 'archived';
    render(<ProjectActionButtons projectId="projectId" />);
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument();
  });

  it('hides the Volunteer button once the volunteering phase has ended', () => {
    mockTimelinePhases = [
      buildPhase('volunteering-phase', 'volunteering', {
        start_at: day(-14),
        end_at: day(-7),
      }),
    ];
    render(<ProjectActionButtons projectId="projectId" />);
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument();
  });

  it('hides the Volunteer button when the timeline option is unchecked in the participation box', () => {
    render(
      <ProjectActionButtons
        projectId="projectId"
        hiddenOptionIds={[volunteeringPhase.id]}
      />
    );
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument();
  });

  it('collapses into the Participate modal when volunteering is joined by two open spotlight surveys', () => {
    mockStandalonePhases = [
      spotlightSurvey('survey-1'),
      spotlightSurvey('survey-2'),
    ];
    render(<ProjectActionButtons projectId="projectId" />);
    expect(screen.getByText('Participate')).toBeInTheDocument();
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument();
  });
});
