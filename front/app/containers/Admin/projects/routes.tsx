import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import Loading from 'components/UI/Loading';

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
      <Loading>
        <AdminProjectsAndFolders />
      </Loading>
    ),
    children: [
      {
        index: true,
        element: (
          <Loading>
            <AdminProjectsList />
          </Loading>
        ),
      },
      ...moduleConfiguration.routes['admin.project_templates'],
      ...moduleConfiguration.routes['admin.projects'],
      {
        path: 'new',
        element: (
          <Loading>
            <AdminProjectsProjectGeneral />
          </Loading>
        ),
      },
      {
        path: ':projectId',
        element: (
          <Loading>
            <AdminProjectsProjectIndex />
          </Loading>
        ),
        // all routes under /admin/projects/:projectId
        children: [
          {
            index: true,
            element: (
              <Loading>
                <AdminProjectsProjectGeneral />
              </Loading>
            ),
          },
          {
            path: 'edit',
            element: (
              <Loading>
                <AdminProjectsProjectIndex />
              </Loading>
            ),
          },
          {
            path: 'timeline',
            element: (
              <Loading>
                <AdminProjectTimeline />
              </Loading>
            ),
          },
          {
            path: 'timeline/new',
            element: (
              <Loading>
                <AdminProjectTimelineNewAndEdit />
              </Loading>
            ),
          },
          {
            path: 'timeline/:id',
            element: (
              <Loading>
                <AdminProjectTimelineNewAndEdit />
              </Loading>
            ),
          },
          {
            path: 'events',
            element: (
              <Loading>
                <AdminProjectEvents />
              </Loading>
            ),
          },
          {
            path: 'events/new',
            element: (
              <Loading>
                <AdminProjectEventsEdit />
              </Loading>
            ),
          },
          {
            path: 'events/:id',
            element: (
              <Loading>
                <AdminProjectEventsEdit />
              </Loading>
            ),
          },
          {
            path: 'permissions',
            element: (
              <Loading>
                <AdminProjectPermissions />
              </Loading>
            ),
          },
          {
            path: 'survey-results',
            element: (
              <Loading>
                <AdminProjectSurveyResults />
              </Loading>
            ),
          },
          {
            path: 'poll',
            element: (
              <Loading>
                <AdminProjectPoll />
              </Loading>
            ),
          },
          {
            path: 'description',
            element: (
              <Loading>
                <AdminProjectDescription />
              </Loading>
            ),
          },
          {
            path: 'ideas',
            element: (
              <Loading>
                <AdminProjectIdeas />
              </Loading>
            ),
          },
          {
            path: 'volunteering',
            element: (
              <Loading>
                <AdminProjectVolunteering />
              </Loading>
            ),
          },
          {
            path: 'volunteering/causes/new',
            element: (
              <Loading>
                <AdminProjectVolunteeringNew />
              </Loading>
            ),
          },
          {
            path: 'volunteering/phases/:phaseId/causes/new',
            element: (
              <Loading>
                <AdminProjectVolunteeringNew />
              </Loading>
            ),
          },
          {
            path: 'volunteering/causes/:causeId',
            element: (
              <Loading>
                <AdminProjectVolunteeringEdit />
              </Loading>
            ),
          },
        ],
      },
    ],
  };
};

export default createAdminProjectsRoutes;
