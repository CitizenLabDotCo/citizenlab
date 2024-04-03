import React, { lazy } from 'react';

import moduleConfiguration from 'modules';
import { Navigate } from 'react-router-dom';
import { RouteType } from 'routes';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import AdminProjectIdeaPreviewIndex from './AdminProjectIdeaPreviewIndex';
import IdeaFormBuilder from './project/inputForm/IdeaFormBuilder';
import SurveyFormBuilder from './project/nativeSurvey/SurveyFormBuilder';

const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
const AdminProjectsProjectIndex = lazy(() => import('./project'));
const AdminProjectsProjectSettings = lazy(() => import('./project/settings'));
const AdminProjectsProjectGeneral = lazy(() => import('./project/general'));
const AdminPhaseNewAndEdit = lazy(() => import('./project/timeline/edit'));
const AdminProjectEvents = lazy(() => import('./project/events'));
const AdminProjectEventsEdit = lazy(() => import('./project/events/edit'));
const AdminProjectPermissions = lazy(() => import('./project/permissions'));
const AdminProjectSurveyResults = lazy(() => import('./project/surveyResults'));
const AdminProjectPoll = lazy(() => import('./project/poll'));
const AdminProjectsSurvey = lazy(() => import('./project/nativeSurvey'));

const AdminProjectDescription = lazy(() => import('./project/description'));
const AdminProjectIdeaForm = lazy(() => import('./project/inputForm'));

const AdminProjectIdeas = lazy(() => import('./project/ideas'));
const OfflineInputImporter = lazy(() => import('./project/inputImporter'));

const AdminProjectVolunteering = lazy(() => import('./project/volunteering'));
const AdminProjectVolunteeringNew = lazy(
  () => import('./project/volunteering/NewCause')
);
const AdminProjectVolunteeringEdit = lazy(
  () => import('./project/volunteering/EditCause')
);
const AdminAllowedTopicsComponent = React.lazy(
  () => import('./project/topics')
);
const AdminCustomMapConfigComponent = React.lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const AdminProjectAnalysis = lazy(() => import('./project/analysis'));
const ReportTab = lazy(() => import('./project/information/ReportTab'));

export function adminProjectsProjectPath(projectId: string): RouteType {
  return `/admin/projects/${projectId}`;
}

export enum projectsRoutes {
  projects = 'projects',
  projectIdeaId = ':projectId/ideas/:ideaId',
  projectSettings = ':projectId/settings',
  projectSettingsDescription = 'description',
  projectSettingsEvents = 'events',
  projectSettingsEventsNew = 'events/new',
  projectSettingsEventsId = 'events/:id',
  projectSettingsTags = 'tags',
  projectSettingsAccessRights = 'access-rights',
  projectId = ':projectId',
  projectPhasesSetup = 'phases/setup',
  projectPhaseSetup = 'phases/:phaseId/setup',
  projectNewPhase = 'phases/new',
  projectPhase = 'phases/:phaseId',
  projectPhaseSurveyResults = 'phases/:phaseId/survey-results',
  projectPhasePolls = 'phases/:phaseId/polls',
  projectPhaseAccessRights = 'phases/:phaseId/access-rights',
  projectPhaseIdeas = 'phases/:phaseId/ideas',
  projectPhaseIdeaForm = 'phases/:phaseId/ideaform',
  projectPhaseVolunteering = 'phases/:phaseId/volunteering',
  projectPhaseMap = 'phases/:phaseId/map',
  projectPhaseNativeSurvey = 'phases/:phaseId/native-survey',
  projectPhaseVolunteeringNewCause = 'phases/:phaseId/volunteering/causes/new',
  projectPhaseIdeaFormEdit = 'phases/:phaseId/ideaform/edit',
  projectPhaseNativeSurveyEdit = 'phases/:phaseId/native-survey/edit',
  projectPhaseVolunteeringCause = 'phases/:phaseId/volunteering/causes/:causeId',
  projectAnalysis = 'analysis/:analysisId',
  projectPhaseInputImporter = 'phases/:phaseId/input-importer',
  projectPhaseReport = 'phases/:phaseId/report',
}

export type projectsRouteTypes =
  | AdminRoute<projectsRoutes.projects>
  | AdminRoute<`${projectsRoutes.projects}/${string}/ideas/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/settings`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsEvents}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsDescription}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsEvents}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsTags}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectPhasesSetup}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/setup`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectNewPhase}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-results`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/polls`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/access-rights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/ideas`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/ideaform`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/map`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/ideaform/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/native-survey/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/native-survey/edit?${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/${string}`>
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
        path: projectsRoutes.projectIdeaId,
        element: (
          <PageLoading>
            <AdminProjectIdeaPreviewIndex />
          </PageLoading>
        ),
      },
      {
        path: projectsRoutes.projectSettings,
        element: (
          <PageLoading>
            <AdminProjectsProjectSettings />
          </PageLoading>
        ),
        children: [
          {
            index: true,
            element: (
              <PageLoading>
                <AdminProjectsProjectGeneral />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectSettingsDescription,
            element: (
              <PageLoading>
                <AdminProjectDescription />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectSettingsEvents,
            element: (
              <PageLoading>
                <AdminProjectEvents />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectSettingsEventsNew,
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectSettingsEventsId,
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectSettingsTags,
            element: <AdminAllowedTopicsComponent />,
          },
          {
            path: projectsRoutes.projectSettingsAccessRights,
            element: (
              <PageLoading>
                <AdminProjectPermissions />
              </PageLoading>
            ),
          },
        ],
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
            path: projectsRoutes.projectNewPhase,
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
            path: projectsRoutes.projectPhaseSurveyResults,
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
                <AdminProjectPermissions />
              </PageLoading>
            ),
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
            path: projectsRoutes.projectPhaseNativeSurvey,
            element: <AdminProjectsSurvey />,
          },
          {
            path: projectsRoutes.projectPhaseIdeaFormEdit,
            element: <IdeaFormBuilder />,
          },
          {
            path: projectsRoutes.projectPhaseNativeSurveyEdit,
            element: <SurveyFormBuilder />,
          },
          {
            path: projectsRoutes.projectPhaseVolunteeringCause,
            element: (
              <PageLoading>
                <AdminProjectVolunteeringEdit />
              </PageLoading>
            ),
          },
          // {
          //   path: 'allowed-input-topics',
          //   element: <AdminAllowedTopicsComponent />,
          // },
          {
            path: projectsRoutes.projectAnalysis,
            element: (
              <PageLoading>
                <AdminProjectAnalysis />
              </PageLoading>
            ),
          },
          {
            path: projectsRoutes.projectPhaseInputImporter,
            element: (
              <PageLoading>
                <OfflineInputImporter />
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
          ...moduleConfiguration.routes['admin.projects.project'],
        ],
      },
    ],
  };
};

export default createAdminProjectsRoutes;
