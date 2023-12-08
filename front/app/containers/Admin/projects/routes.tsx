import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import IdeaFormBuilder from './project/inputForm/IdeaFormBuilder';
import SurveyFormBuilder from './project/nativeSurvey/SurveyFormBuilder';
import AdminProjectIdeaPreviewIndex from './AdminProjectIdeaPreviewIndex';
import { Navigate } from 'react-router-dom';

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
const AdminQrCode = lazy(() => import('./project/qrCode'));

const AdminProjectIdeas = lazy(() => import('./project/ideas'));
const OfflineInputImporter = lazy(() => import('./project/offlineInputs'));

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

const AdminProjectAnalysis = lazy(() => import('./project/analysis'));

export function adminProjectsProjectPath(projectId: string) {
  return `/admin/projects/${projectId}`;
}

const createAdminProjectsRoutes = () => {
  return {
    path: 'projects',
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
        path: ':projectId/ideas/:ideaId',
        element: (
          <PageLoading>
            <AdminProjectIdeaPreviewIndex />
          </PageLoading>
        ),
      },
      {
        path: ':projectId/settings',
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
            path: 'description',
            element: (
              <PageLoading>
                <AdminProjectDescription />
              </PageLoading>
            ),
          },
          {
            path: 'events',
            element: (
              <PageLoading>
                <AdminProjectEvents />
              </PageLoading>
            ),
          },
          {
            path: 'events/new',
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: 'events/:id',
            element: (
              <PageLoading>
                <AdminProjectEventsEdit />
              </PageLoading>
            ),
          },
          {
            path: 'tags',
            element: <AdminAllowedTopicsComponent />,
          },
          {
            path: 'access-rights',
            element: (
              <PageLoading>
                <AdminProjectPermissions />
              </PageLoading>
            ),
          },
        ],
      },
      {
        path: ':projectId',
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
            path: 'phases/setup',
            element: (
              <PageLoading>
                <AdminPhaseNewAndEdit />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/setup',
            element: (
              <PageLoading>
                <AdminPhaseNewAndEdit />
              </PageLoading>
            ),
          },
          {
            path: 'phases/new',
            element: (
              <PageLoading>
                <AdminPhaseNewAndEdit />
              </PageLoading>
            ),
          },
          // TODO: Hook up input manager on phase
          // {
          //   path: 'timeline/:id/ideas',
          //   element: (
          //     <PageLoading>
          //       <AdminProjectIdeas />
          //     </PageLoading>
          //   ),
          // },
          {
            path: 'phases/:phaseId',
            element: (
              <PageLoading>
                <AdminPhaseNewAndEdit />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/qr-code',
            element: (
              <PageLoading>
                <AdminQrCode />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/survey-results',
            element: (
              <PageLoading>
                <AdminProjectSurveyResults />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/polls',
            element: (
              <PageLoading>
                <AdminProjectPoll />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/access-rights',
            element: (
              <PageLoading>
                <AdminProjectPermissions />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/ideas',
            element: (
              <PageLoading>
                <AdminProjectIdeas />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/ideaform',
            element: (
              <PageLoading>
                <AdminProjectIdeaForm />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/volunteering',
            element: (
              <PageLoading>
                <AdminProjectVolunteering />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/volunteering/causes/new',
            element: (
              <PageLoading>
                <AdminProjectVolunteeringNew />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/native-survey',
            element: <AdminProjectsSurvey />,
          },
          {
            path: 'phases/:phaseId/volunteering/causes/new',
            element: (
              <PageLoading>
                <AdminProjectVolunteeringNew />
              </PageLoading>
            ),
          },
          {
            path: 'ideaform/edit',
            element: <IdeaFormBuilder />,
          },
          {
            path: 'phases/:phaseId/ideaform/edit',
            element: <IdeaFormBuilder />,
          },
          {
            path: 'native-survey/edit',
            element: <SurveyFormBuilder />,
          },
          {
            path: 'phases/:phaseId/native-survey/edit',
            element: <SurveyFormBuilder />,
          },
          {
            path: 'phases/:phaseId/volunteering/causes/:causeId',
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
            path: 'analysis/:analysisId',
            element: (
              <PageLoading>
                <AdminProjectAnalysis />
              </PageLoading>
            ),
          },
          {
            path: 'phases/:phaseId/offline-inputs',
            element: (
              <PageLoading>
                <OfflineInputImporter />
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
