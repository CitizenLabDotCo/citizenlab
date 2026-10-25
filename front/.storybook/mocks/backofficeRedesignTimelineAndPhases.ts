// Storybook-only data for the "Timeline and phases" stories of the
// redesigned project back office (Phase/ and NewPhase/). Adds phases of the
// other participation methods and the endpoints their build panel reads
// (poll questions, causes, the phase report, permissions) on top of
// ./backofficeRedesign.
import React from 'react';

import { Decorator } from '@storybook/react';
// The route params (project, phase) the pieces read, which the preview's
// own router (a bare root route) does not have.
// eslint-disable-next-line no-restricted-imports
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { delay, http, HttpResponse } from 'msw';

import { getAppConfigurationData } from '../../app/api/app_configuration/__mocks__/_mockServer';
import { ICauseData } from '../../app/api/causes/types';
import { IPermissionData } from '../../app/api/permissions/types';
import { IPhaseData } from '../../app/api/phases/types';
import { IPollQuestionData } from '../../app/api/poll_questions/types';
import { project1 } from '../../app/api/projects/__mocks__/_mockServer';
import { reportsData } from '../../app/api/reports/__mocks__/_mockServer';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  infoPhase,
  mockPhases,
} from './backofficeRedesign';

const API = '/web_api/v1';

const withMethod = (
  base: IPhaseData,
  id: string,
  title: string,
  attributes: Partial<IPhaseData['attributes']>
): IPhaseData => ({
  ...base,
  id,
  attributes: {
    ...base.attributes,
    title_multiloc: { en: title },
    ...attributes,
  },
});

export const surveyPhase = withMethod(
  ideationPhase,
  'bo-phase-survey',
  'Tell us about your street',
  {
    participation_method: 'native_survey',
    ideas_count: 0,
    native_survey_title_multiloc: { en: 'Survey' },
    native_survey_button_multiloc: { en: 'Take the survey' },
  }
);

// A survey with responses: switching to another survey method is locked.
export const answeredSurveyPhase = withMethod(
  surveyPhase,
  'bo-phase-survey-answered',
  'Tell us about your street',
  { ideas_count: 12 }
);

export const externalSurveyPhase = withMethod(
  ideationPhase,
  'bo-phase-external-survey',
  'Mobility survey',
  {
    participation_method: 'survey',
    ideas_count: 0,
    survey_service: 'typeform',
    survey_embed_url: 'https://citizenlab.typeform.com/to/abc',
  }
);

export const pollPhase = withMethod(
  ideationPhase,
  'bo-phase-poll',
  'Quick poll on the opening hours',
  { participation_method: 'poll', ideas_count: 0 }
);

export const volunteeringPhase = withMethod(
  ideationPhase,
  'bo-phase-volunteering',
  'Plant the trees together',
  { participation_method: 'volunteering', ideas_count: 0 }
);

export const commonGroundPhase = withMethod(
  ideationPhase,
  'bo-phase-common-ground',
  'Find common ground',
  { participation_method: 'common_ground', ideas_count: 0 }
);

// The information phase with a report attached.
export const infoPhaseWithReport: IPhaseData = {
  ...infoPhase,
  id: 'bo-phase-info-report',
  relationships: {
    ...infoPhase.relationships,
    report: { data: { id: reportsData[0].id, type: 'report' } },
  },
};

const allPhases = [
  ...mockPhases,
  surveyPhase,
  answeredSurveyPhase,
  externalSurveyPhase,
  pollPhase,
  volunteeringPhase,
  commonGroundPhase,
  infoPhaseWithReport,
];

export const mockCauses: ICauseData[] = [
  'Dig the planting holes',
  'Water the young trees in summer',
  'Bring tools and gloves',
].map((title, i) => ({
  id: `bo-cause-${i + 1}`,
  type: 'cause',
  attributes: {
    title_multiloc: { en: title },
    description_multiloc: { en: `<p>${title}.</p>` },
    volunteers_count: [8, 3, 0][i],
    ordering: i,
  },
  relationships: { phase: { data: { id: volunteeringPhase.id } } },
}));

export const mockPollQuestions: IPollQuestionData[] = [
  {
    id: 'bo-poll-question-1',
    type: 'question',
    attributes: {
      question_type: 'single_option',
      title_multiloc: { en: 'When should the library open on Sundays?' },
      max_options: null,
      ordering: 0,
    },
    relationships: {
      phase: { data: { id: pollPhase.id } },
      options: { data: [] },
    },
  },
];

// The "Submitting ideas" permission: who can post, and what they are asked.
export const postingPermission: IPermissionData = {
  id: 'bo-permission-posting',
  type: 'permission',
  attributes: {
    action: 'posting_idea',
    permitted_by: 'users',
    created_at: '2025-03-28T12:29:20.848Z',
    updated_at: '2025-03-28T13:15:59.410Z',
    custom_fields_behavior: 'global',
    verification_enabled: false,
    verification_expiry: null,
    access_denied_explanation_multiloc: {},
    everyone_tracking_enabled: false,
    user_data_collection: 'all_data',
    user_fields_in_form_descriptor: {
      value: false,
      locked: false,
      explanation: null,
    },
    require_confirmed_email: true,
    confirmed_email_expiry: null,
    require_confirmed_phone_number: false,
    confirmed_phone_number_expiry: null,
    require_name: true,
    require_password: true,
    require_verification: false,
    permitted_by_everyone_allowed: true,
    inherited: false,
  },
  relationships: {
    permission_scope: { data: { id: ideationPhase.id, type: 'phase' } },
    groups: { data: [] },
  },
};

const links = (path: string) => ({
  self: `${API}${path}?page%5Bnumber%5D=1`,
  first: `${API}${path}?page%5Bnumber%5D=1`,
  prev: null,
  next: null,
  last: `${API}${path}?page%5Bnumber%5D=1`,
});

const baseConfig = getAppConfigurationData();

// Report builder and external surveys switched on, so the information
// phase shows its report and the survey choice shows every method.
export const appConfigurationHandler = http.get(
  `${API}/app_configuration`,
  () =>
    HttpResponse.json({
      data: {
        ...baseConfig,
        attributes: {
          ...baseConfig.attributes,
          settings: {
            ...baseConfig.attributes.settings,
            report_builder: { allowed: true, enabled: true },
            surveys: { allowed: true, enabled: true },
            typeform_surveys: { allowed: true, enabled: true },
            google_forms_surveys: { allowed: true, enabled: true },
          },
        },
      },
    })
);

export const postingPermissionHandler = http.get(
  `${API}/phases/:id/permissions`,
  () => HttpResponse.json({ data: [postingPermission] })
);

// Who can volunteer and attend events: logged-in users, and everyone.
export const accessPermissionsHandler = http.get(
  `${API}/phases/:id/permissions`,
  () =>
    HttpResponse.json({
      data: [
        {
          ...postingPermission,
          id: 'bo-permission-volunteering',
          attributes: {
            ...postingPermission.attributes,
            action: 'volunteering',
          },
        },
        {
          ...postingPermission,
          id: 'bo-permission-attending',
          attributes: {
            ...postingPermission.attributes,
            action: 'attending_event',
            permitted_by: 'everyone',
          },
        },
      ],
    })
);

// Never answers: the piece stays in its loading state.
export const pendingPermissionsHandler = http.get(
  `${API}/phases/:id/permissions`,
  async () => {
    await delay('infinite');
    return HttpResponse.json({ data: [] });
  }
);

export const noCausesHandler = http.get(`${API}/phases/:id/causes`, () =>
  HttpResponse.json({ data: [], links: links('/causes') })
);

export const noPollQuestionsHandler = http.get(
  `${API}/phases/:id/poll_questions`,
  () => HttpResponse.json({ data: [] })
);

const handlers = {
  appConfiguration: appConfigurationHandler,
  phases: http.get(`${API}/projects/:projectId/phases`, () =>
    HttpResponse.json({ data: mockPhases })
  ),
  phase: http.get(`${API}/phases/:id`, ({ params }) =>
    HttpResponse.json({
      data: allPhases.find((p) => p.id === params.id) ?? ideationPhase,
    })
  ),
  // The file library behind "Select a file": empty.
  files: http.get(`${API}/files`, () =>
    HttpResponse.json({ data: [], links: links('/files') })
  ),
  // The user groups an action can be limited to: none.
  groups: http.get(`${API}/groups`, () =>
    HttpResponse.json({ data: [], links: links('/groups') })
  ),
  // No demographic questions curated on the permission.
  permissionCustomFields: http.get(
    `${API}/phases/:id/permissions/:action/permissions_custom_fields`,
    () => HttpResponse.json({ data: [] })
  ),
  causes: http.get(`${API}/phases/:id/causes`, () =>
    HttpResponse.json({ data: mockCauses, links: links('/causes') })
  ),
  pollQuestions: http.get(`${API}/phases/:id/poll_questions`, () =>
    HttpResponse.json({ data: mockPollQuestions })
  ),
  pollOptions: http.get(`${API}/poll_questions/:id/poll_options`, () =>
    HttpResponse.json({
      data: ['10:00', '12:00', 'Not at all'].map((title, i) => ({
        id: `bo-poll-option-${i + 1}`,
        type: 'option',
        attributes: { title_multiloc: { en: title }, ordering: i },
      })),
    })
  ),
};

/** The shared handlers plus the ones above, which win over them. */
export const timelineAndPhasesHandlers = [
  ...Object.values(handlers),
  ...backofficeRedesignHandlers,
];

// Renders the story at the phase's admin route, so `useParams` gives the
// project and phase ids as on the page (the dates picker and the phase
// description read them). Without a phase id: the new phase route.
const PhaseRoute = ({
  phaseId,
  children,
}: {
  phaseId?: string;
  children?: React.ReactNode;
}) => {
  const childrenRef = React.useRef(children);
  childrenRef.current = children;

  const router = React.useMemo(() => {
    const rootRoute = createRootRoute();
    const page = () =>
      React.createElement(React.Fragment, null, childrenRef.current);
    const routeTree = rootRoute.addChildren([
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/admin/projects/$projectId/phases/new',
        component: page,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/admin/projects/$projectId/phases/$phaseId/setup',
        component: page,
      }),
    ]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          phaseId
            ? `/admin/projects/${project1.id}/phases/${phaseId}/setup`
            : `/admin/projects/${project1.id}/phases/new`,
        ],
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return React.createElement(RouterProvider, { router });
};

/** At the given phase's route, or the new phase route without one. */
export const phaseRoute =
  (phaseId?: string): Decorator =>
  (Story) =>
    React.createElement(PhaseRoute, { phaseId }, React.createElement(Story));

/** At the route of the story's `phaseId` or `phase` arg. */
export const withPhaseRoute: Decorator = (Story, { args }) => {
  const { phaseId, phase } = args as { phaseId?: string; phase?: IPhaseData };
  return React.createElement(
    PhaseRoute,
    { phaseId: phaseId ?? phase?.id },
    React.createElement(Story)
  );
};
