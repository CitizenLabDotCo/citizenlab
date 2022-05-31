import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import { LoadingComponent } from 'routes';

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
const AdminProjectDescription = lazy(() => import('./project/description'));
const AdminProjectIdeas = lazy(() => import('./project/ideas'));
const AdminProjectVolunteering = lazy(() => import('./project/volunteering'));
const AdminProjectVolunteeringNew = lazy(
  () => import('./project/volunteering/NewCause')
);
const AdminProjectVolunteeringEdit = lazy(
  () => import('./project/volunteering/EditCause')
);

export function adminProjectsProjectPath(projectId: string) {
  return `/admin/projects/${projectId}`;
}

const createAdminProjectsRoutes = () => {
  return {
    path: 'projects',
    element: (
      <LoadingComponent>
        <AdminProjectsAndFolders />
      </LoadingComponent>
    ),
    children: [
      {
        index: true,
        element: (
          <LoadingComponent>
            <AdminProjectsList />
          </LoadingComponent>
        ),
      },
      ...moduleConfiguration.routes['admin.project_templates'],
      ...moduleConfiguration.routes['admin.projects'],
      {
        path: 'new',
        element: (
          <LoadingComponent>
            <AdminProjectsProjectGeneral />
          </LoadingComponent>
        ),
      },
      {
        path: ':projectId',
        element: (
          <LoadingComponent>
            <AdminProjectsProjectIndex />
          </LoadingComponent>
        ),
        // all routes under /admin/projects/:projectId
        children: [
          {
            index: true,
            element: (
              <LoadingComponent>
                <AdminProjectsProjectGeneral />
              </LoadingComponent>
            ),
          },
          {
            path: 'edit',
            element: (
              <LoadingComponent>
                <AdminProjectsProjectIndex />
              </LoadingComponent>
            ),
          },
          {
            path: 'timeline',
            element: (
              <LoadingComponent>
                <AdminProjectTimeline />
              </LoadingComponent>
            ),
          },
          {
            path: 'timeline/new',
            element: (
              <LoadingComponent>
                <AdminProjectTimelineNewAndEdit />
              </LoadingComponent>
            ),
          },
          {
            path: 'timeline/:id',
            element: (
              <LoadingComponent>
                <AdminProjectTimelineNewAndEdit />
              </LoadingComponent>
            ),
          },
          {
            path: 'events',
            element: (
              <LoadingComponent>
                <AdminProjectEvents />
              </LoadingComponent>
            ),
          },
          {
            path: 'events/new',
            element: (
              <LoadingComponent>
                <AdminProjectEventsEdit />
              </LoadingComponent>
            ),
          },
          {
            path: 'events/:id',
            element: (
              <LoadingComponent>
                <AdminProjectEventsEdit />
              </LoadingComponent>
            ),
          },
          {
            path: 'permissions',
            element: (
              <LoadingComponent>
                <AdminProjectPermissions />
              </LoadingComponent>
            ),
          },
          {
            path: 'survey-results',
            element: (
              <LoadingComponent>
                <AdminProjectSurveyResults />
              </LoadingComponent>
            ),
          },
          {
            path: 'poll',
            element: (
              <LoadingComponent>
                <AdminProjectPoll />
              </LoadingComponent>
            ),
          },
          {
            path: 'description',
            element: (
              <LoadingComponent>
                <AdminProjectDescription />
              </LoadingComponent>
            ),
          },
          {
            path: 'ideas',
            element: (
              <LoadingComponent>
                <AdminProjectIdeas />
              </LoadingComponent>
            ),
          },
          {
            path: 'volunteering',
            element: (
              <LoadingComponent>
                <AdminProjectVolunteering />
              </LoadingComponent>
            ),
          },
          {
            path: 'volunteering/causes/new',
            element: (
              <LoadingComponent>
                <AdminProjectVolunteeringNew />
              </LoadingComponent>
            ),
          },
          {
            path: 'volunteering/phases/:phaseId/causes/new',
            element: (
              <LoadingComponent>
                <AdminProjectVolunteeringNew />
              </LoadingComponent>
            ),
          },
          {
            path: 'volunteering/causes/:causeId',
            element: (
              <LoadingComponent>
                <AdminProjectVolunteeringEdit />
              </LoadingComponent>
            ),
          },
        ],
      },
    ],
  };
};

export default createAdminProjectsRoutes;
