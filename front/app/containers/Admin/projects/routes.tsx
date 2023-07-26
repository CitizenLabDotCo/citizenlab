import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import IdeaFormBuilder from './project/inputForm/IdeaFormBuilder';
import SurveyFormBuilder from './project/nativeSurvey/SurveyFormBuilder';
import AdminProjectIdeaPreviewIndex from './AdminProjectIdeaPreviewIndex';

const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
const AdminProjectsProjectIndex = lazy(() => import('./project'));
const AdminProjectsProjectGeneral = lazy(() => import('./project/general'));
const AdminProjectTimeline = lazy(() => import('./project/timeline'));
const AdminProjectTimelineNewAndEdit = lazy(
  () => import('./project/timeline/edit')
);
const AdminProjectEvents = lazy(() => import('./project/events'));
const AdminProjectEventsEdit = lazy(() => import('./project/events/edit'));
const AdminProjectPermissions = lazy(() => import('./project/permissions'));
const AdminProjectSurveyResults = lazy(() => import('./project/surveyResults'));
const AdminProjectPoll = lazy(() => import('./project/poll'));
const AdminProjectsSurvey = lazy(() => import('./project/nativeSurvey'));

const AdminProjectDescription = lazy(() => import('./project/description'));
const AdminProjectIdeaForm = lazy(() => import('./project/inputForm'));
const AdminProjectIdeas = lazy(() => import('./project/ideas'));
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
        path: ':projectId',
        element: (
          <PageLoading>
            <AdminProjectsProjectIndex />
          </PageLoading>
        ),
        // all routes under /admin/projects/:projectId
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
            path: 'timeline',
            element: (
              <PageLoading>
                <AdminProjectTimeline />
              </PageLoading>
            ),
          },
          {
            path: 'timeline/new',
            element: (
              <PageLoading>
                <AdminProjectTimelineNewAndEdit />
              </PageLoading>
            ),
          },
          {
            path: 'timeline/:id/ideas',
            element: (
              <PageLoading>
                <AdminProjectIdeas />
              </PageLoading>
            ),
          },
          {
            path: 'timeline/:id',
            element: (
              <PageLoading>
                <AdminProjectTimelineNewAndEdit />
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
            path: 'permissions',
            element: (
              <PageLoading>
                <AdminProjectPermissions />
              </PageLoading>
            ),
          },
          {
            path: 'survey-results',
            element: (
              <PageLoading>
                <AdminProjectSurveyResults />
              </PageLoading>
            ),
          },
          {
            path: 'poll',
            element: (
              <PageLoading>
                <AdminProjectPoll />
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
            path: 'ideas',
            element: (
              <PageLoading>
                <AdminProjectIdeas />
              </PageLoading>
            ),
          },
          {
            path: 'ideaform',
            element: (
              <PageLoading>
                <AdminProjectIdeaForm />
              </PageLoading>
            ),
          },
          {
            path: 'volunteering',
            element: (
              <PageLoading>
                <AdminProjectVolunteering />
              </PageLoading>
            ),
          },
          {
            path: 'volunteering/causes/new',
            element: (
              <PageLoading>
                <AdminProjectVolunteeringNew />
              </PageLoading>
            ),
          },
          {
            path: 'native-survey',
            element: <AdminProjectsSurvey />,
          },
          {
            path: 'native-survey/results',
            element: <AdminProjectsSurvey />,
          },
          {
            path: 'volunteering/phases/:phaseId/causes/new',
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
            path: 'volunteering/causes/:causeId',
            element: (
              <PageLoading>
                <AdminProjectVolunteeringEdit />
              </PageLoading>
            ),
          },
          {
            path: 'allowed-input-topics',
            element: <AdminAllowedTopicsComponent />,
          },
          {
            path: 'analysis/:analysisId',
            element: (
              <PageLoading>
                <AdminProjectAnalysis />
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
