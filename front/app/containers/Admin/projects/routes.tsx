import React, { lazy } from 'react';

import moduleConfiguration from 'modules';
import { Navigate } from 'react-router-dom';
import { RouteType } from 'routes';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const AdminProjectIdeaPreviewIndex = lazy(
  () => import('./AdminProjectIdeaPreviewIndex')
);
const IdeaFormBuilder = lazy(
  () => import('./project/inputForm/IdeaFormBuilder')
);
const SurveyFormBuilder = lazy(
  () => import('./project/nativeSurvey/SurveyFormBuilder')
);
const ProjectMessaging = lazy(() => import('./project/messaging/All'));
const ProjectMessagingNew = lazy(() => import('./project/messaging/New'));
const ProjectMessagingEdit = lazy(() => import('./project/messaging/Edit'));
const ProjectMessagingShow = lazy(() => import('./project/messaging/Show'));
const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
const AdminProjectNew = lazy(() => import('./new'));
const AdminProjectsProjectIndex = lazy(() => import('./project'));
const AdminProjectPhaseIndex = lazy(() => import('./project/phase'));
const AdminProjectsProjectGeneral = lazy(() => import('./project/general'));
const AdminProjectsProjectGeneralSetUp = lazy(
  () => import('./project/general/setUp')
);
const AdminProjectsProjectAudience = lazy(
  () => import('../../../components/admin/participation')
);
const AdminPhaseNewAndEdit = lazy(() => import('./project/phaseSetup'));
const AdminProjectFiles = lazy(() => import('./project/files'));
const AdminProjectEvents = lazy(() => import('./project/events'));
const AdminProjectEventsEdit = lazy(() => import('./project/events/edit'));
const AdminProjectPermissions = lazy(
  () => import('./project/permissions/Project')
);
const AdminPhasePermissions = lazy(() => import('./project/permissions/Phase'));
const AdminPhaseEmails = lazy(
  () => import('./project/admin_phase_email_wrapper')
);
const AdminProjectSurveyResults = lazy(() => import('./project/surveyResults'));
const AdminProjectPoll = lazy(() => import('./project/poll'));
const AdminProjectsSurvey = lazy(() => import('./project/nativeSurvey'));

const AdminProjectIdeaForm = lazy(() => import('./project/inputForm'));
const AdminPhaseSurveyFormTabPanel = lazy(
  () => import('./project/surveyForm/TabPanel')
);

const AdminProjectIdeas = lazy(() => import('./project/ideas'));
const InputImporter = lazy(() => import('./project/inputImporter'));

const AdminProjectVolunteering = lazy(() => import('./project/volunteering'));
const AdminProjectVolunteeringNew = lazy(
  () => import('./project/volunteering/NewCause')
);
const AdminProjectVolunteeringEdit = lazy(
  () => import('./project/volunteering/EditCause')
);
const AdminAllowedTopicsComponent = lazy(() => import('./project/topics'));
const AdminCustomMapConfigComponent = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const AdminProjectAnalysis = lazy(() => import('./project/analysis'));
const ReportTab = lazy(() => import('./project/information/ReportTab'));
const AdminPhaseInsights = lazy(() => import('./project/insights'));

const AdminProjectProposals = lazy(() => import('./project/proposals'));

const AdminProjectsData = lazy(() => import('./project/data'));

const EmailsEdit = lazy(() => import('../messaging/Edit'));

export function adminProjectsProjectPath(projectId: string): RouteType {
  return `/admin/projects/${projectId}`;
}

export enum projectsRoutes {
  projects = 'projects',
  new = 'new',
  projectIdeaId = ':projectId/ideas/:ideaId',
  projectGeneral = 'general',
  projectGeneralSetUp = 'set-up',
  projectGeneralInputTags = 'input-tags',
  projectGeneralAccessRights = 'access-rights',
  projectGeneralData = 'data',
  projectAudience = 'audience',
  projectSettingsDescription = 'description',
  projectMessaging = 'messaging',
  projectMessagingNew = 'messaging/new',
  projectMessagingEdit = 'messaging/:campaignId/edit',
  projectMessagingShow = 'messaging/:campaignId',
  projectFiles = 'files',
  projectEvents = 'events',
  projectEventsNew = 'events/new',
  projectEventsId = 'events/:id',
  projectSettingsTags = 'tags',
  projectId = ':projectId',
  projectIdPhases = 'phases',
  projectPhasesSetup = 'setup',
  projectPhaseSetup = ':phaseId/setup',
  projectPhase = ':phaseId',
  projectPhaseExternalSurveyResults = ':phaseId/survey-results',
  projectPhasePolls = ':phaseId/polls',
  projectPhaseAccessRights = ':phaseId/access-rights',
  projectPhaseEmails = ':phaseId/emails',
  projectPhaseIdeas = ':phaseId/ideas',
  projectPhaseProposals = ':phaseId/proposals',
  projectPhaseIdeaForm = ':phaseId/form',
  projectPhaseVolunteering = ':phaseId/volunteering',
  projectPhaseMap = ':phaseId/map',
  projectPhaseNativeSurveyResults = ':phaseId/results',
  projectPhaseSurveyForm = ':phaseId/survey-form',
  projectPhaseNativeSurveyFormEdit = ':phaseId/survey-form/edit',
  projectPhaseVolunteeringNewCause = ':phaseId/volunteering/causes/new',
  projectPhaseIdeaFormEdit = ':phaseId/form/edit',
  projectPhaseVolunteeringCause = ':phaseId/volunteering/causes/:causeId',
  projectPhaseInputImporter = ':phaseId/input-importer',
  projectPhaseReport = ':phaseId/report',
  projectPhaseInsights = ':phaseId/insights',
  projectAnalysis = 'analysis/:analysisId',
}

export type projectsRouteTypes =
  | AdminRoute<projectsRoutes.projects>
  | AdminRoute<`${projectsRoutes.projects}/${projectsRoutes.new}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/ideas/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/set-up`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/input-tags`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/access-rights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/data`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}/demographics`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}/traffic`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectEvents}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectFiles}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsDescription}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectEvents}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessaging}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingNew}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingEdit}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingShow}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsTags}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectPhasesSetup}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/setup`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${projectsRoutes.new}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-results`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/polls`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/access-rights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/ideas`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/form`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/map`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/results`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/form/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form/edit?${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/emails`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/insights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/analysis/${string}`>;

const createAdminProjectsRoutes = () => {
  return {
    path: projectsRoutes.projects,
    element: (
      <PageLoading>
        <AdminProjectsAndFolders />
      </PageLoading>
    ),
    children: [
      {
        index: true,
        element: (
          <PageLoading>
            <AdminProjectsList />
          </PageLoading>
        ),
      },

      ...moduleConfiguration.routes['admin.project_templates'],
      ...moduleConfiguration.routes['admin.projects'],
      {
        path: projectsRoutes.new,
        element: (
          <PageLoading>
            <AdminProjectNew />
          </PageLoading>
        ),
      },
      {
        path: projectsRoutes.projectIdeaId,
        element: (
          <PageLoading>
            <AdminProjectIdeaPreviewIndex />
          </PageLoading>
        ),
      },
      {
        path: projectsRoutes.projectId,
        element: (
          <PageLoading>
            <AdminProjectsProjectIndex />
          </PageLoading>
        ),
        // all routes under /admin/projects/:projectId
        children: [
          {
            path: '',
            element: <Navigate to="phases/setup" replace />,
          },
          {
            path: projectsRoutes.projectGeneral,
            element: (
              <PageLoading>
                <AdminProjectsProjectGeneral />
              </PageLoading>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageLoading>
                    <AdminProjectsProjectGeneralSetUp />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectGeneralInputTags,
                element: <AdminAllowedTopicsComponent />,
              },
              {
                path: projectsRoutes.projectGeneralAccessRights,
                element: (
                  <PageLoading>
                    <AdminProjectPermissions />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectGeneralData,
                element: (
                  <PageLoading>
                    <AdminProjectsData />
                  </PageLoading>
                ),
              },
            ],
          },
          {
            path: projectsRoutes.projectAudience,
            element: (
              <PageLoading>
                <AdminProjectsProjectAudience />
              </PageLoading>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageLoading>
                    <AdminProjectsProjectAudience />
                  </PageLoading>
                ),
              },
              {
                path: 'demographics',
                element: (
                  <PageLoading>
                    <AdminProjectsProjectAudience />
                  </PageLoading>
                ),
              },
              {
                path: 'traffic',
                element: (
                  <PageLoading>
                    <AdminProjectsProjectAudience />
                  </PageLoading>
                ),
              },
            ],
          },
          {
            path: projectsRoutes.projectMessaging,
            element: (
              <PageLoading>
                <ProjectMessaging />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectMessagingNew,
            element: (
              <PageLoading>
                <ProjectMessagingNew />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectMessagingEdit,
            element: (
              <PageLoading>
                <ProjectMessagingEdit />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectMessagingShow,
            element: (
              <PageLoading>
                <ProjectMessagingShow />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectAnalysis,
            element: (
              <PageLoading>
                <AdminProjectAnalysis />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectFiles,
            element: (
              <PageLoading>
                <AdminProjectFiles />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectEvents,
            element: (
              <PageLoading>
                <AdminProjectEvents />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectEventsNew,
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectEventsId,
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectIdPhases,
            element: (
              <PageLoading>
                <AdminProjectPhaseIndex />
              </PageLoading>
            ),
            // all routes under /admin/projects/:projectId/phases
            children: [
              {
                path: projectsRoutes.projectPhasesSetup,
                element: (
                  <PageLoading>
                    <AdminPhaseNewAndEdit />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseSetup,
                element: (
                  <PageLoading>
                    {/* We use the key here to make sure that the component is treated as a different instance
                    to differentiate between the new and edit phase. This distinction is especially important
                    when the component is already visible and the route changes to the same component.
                    For example, from phase setup to creating a new phase.
                    */}
                    <AdminPhaseNewAndEdit key="setup" />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.new,
                element: (
                  <PageLoading>
                    {/* We use the key here to make sure that the component is treated as a different instance
                    to differentiate between the new and edit phase. This distinction is especially important
                    when the component is already visible and the route changes to the same component.
                    For example, from phase setup to creating a new phase.
                    */}
                    <AdminPhaseNewAndEdit key="new" />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhase,
                element: (
                  <PageLoading>
                    <AdminPhaseNewAndEdit />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseExternalSurveyResults,
                element: (
                  <PageLoading>
                    <AdminProjectSurveyResults />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhasePolls,
                element: (
                  <PageLoading>
                    <AdminProjectPoll />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseAccessRights,
                element: (
                  <PageLoading>
                    <AdminPhasePermissions />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseEmails,
                element: (
                  <PageLoading>
                    <AdminPhaseEmails />
                  </PageLoading>
                ),
              },
              {
                path: ':phaseId/emails/:campaignId/edit',
                element: <EmailsEdit campaignType="automated" />,
              },
              {
                path: projectsRoutes.projectPhaseIdeas,
                element: (
                  <PageLoading>
                    <AdminProjectIdeas />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseIdeaForm,
                element: (
                  <PageLoading>
                    <AdminProjectIdeaForm />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseProposals,
                element: (
                  <PageLoading>
                    <AdminProjectProposals />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseVolunteering,
                element: (
                  <PageLoading>
                    <AdminProjectVolunteering />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseMap,
                element: (
                  <PageLoading>
                    <AdminCustomMapConfigComponent />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseVolunteeringNewCause,
                element: (
                  <PageLoading>
                    <AdminProjectVolunteeringNew />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseNativeSurveyResults,
                element: (
                  <PageLoading>
                    <AdminProjectsSurvey />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseSurveyForm,
                element: (
                  <PageLoading>
                    <AdminPhaseSurveyFormTabPanel />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseIdeaFormEdit,
                element: (
                  <PageLoading>
                    <IdeaFormBuilder />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseNativeSurveyFormEdit,
                element: (
                  <PageLoading>
                    <SurveyFormBuilder />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseVolunteeringCause,
                element: (
                  <PageLoading>
                    <AdminProjectVolunteeringEdit />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseInputImporter,
                element: (
                  <PageLoading>
                    <InputImporter />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseReport,
                element: (
                  <PageLoading>
                    <ReportTab />
                  </PageLoading>
                ),
              },
              {
                path: projectsRoutes.projectPhaseInsights,
                element: (
                  <PageLoading>
                    <AdminPhaseInsights />
                  </PageLoading>
                ),
              },
            ],
          },
        ],
      },
    ],
  };
};

export default createAdminProjectsRoutes;
