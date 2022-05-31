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
      <Loading admin>
        <AdminProjectsAndFolders />
      </Loading>
    ),
    children: [
      {
        index: true,
        element: (
          <Loading admin>
            <AdminProjectsList />
          </Loading>
        ),
      },
      ...moduleConfiguration.routes['admin.project_templates'],
      ...moduleConfiguration.routes['admin.projects'],
      {
        path: 'new',
        element: (
          <Loading admin>
            <AdminProjectsProjectGeneral />
          </Loading>
        ),
      },
      {
        path: ':projectId',
        element: (
          <Loading admin>
            <AdminProjectsProjectIndex />
          </Loading>
        ),
        // all routes under /admin/projects/:projectId
        children: [
          {
            index: true,
            element: (
              <Loading admin>
                <AdminProjectsProjectGeneral />
              </Loading>
            ),
          },
          {
            path: 'edit',
            element: (
              <Loading admin>
                <AdminProjectsProjectIndex />
              </Loading>
            ),
          },
          {
            path: 'timeline',
            element: (
              <Loading admin>
                <AdminProjectTimeline />
              </Loading>
            ),
          },
          {
            path: 'timeline/new',
            element: (
              <Loading admin>
                <AdminProjectTimelineNewAndEdit />
              </Loading>
            ),
          },
          {
            path: 'timeline/:id',
            element: (
              <Loading admin>
                <AdminProjectTimelineNewAndEdit />
              </Loading>
            ),
          },
          {
            path: 'events',
            element: (
              <Loading admin>
                <AdminProjectEvents />
              </Loading>
            ),
          },
          {
            path: 'events/new',
            element: (
              <Loading admin>
                <AdminProjectEventsEdit />
              </Loading>
            ),
          },
          {
            path: 'events/:id',
            element: (
              <Loading admin>
                <AdminProjectEventsEdit />
              </Loading>
            ),
          },
          {
            path: 'permissions',
            element: (
              <Loading admin>
                <AdminProjectPermissions />
              </Loading>
            ),
          },
          {
            path: 'survey-results',
            element: (
              <Loading admin>
                <AdminProjectSurveyResults />
              </Loading>
            ),
          },
          {
            path: 'poll',
            element: (
              <Loading admin>
                <AdminProjectPoll />
              </Loading>
            ),
          },
          {
            path: 'description',
            element: (
              <Loading admin>
                <AdminProjectDescription />
              </Loading>
            ),
          },
          {
            path: 'ideas',
            element: (
              <Loading admin>
                <AdminProjectIdeas />
              </Loading>
            ),
          },
          {
            path: 'volunteering',
            element: (
              <Loading admin>
                <AdminProjectVolunteering />
              </Loading>
            ),
          },
          {
            path: 'volunteering/causes/new',
            element: (
              <Loading admin>
                <AdminProjectVolunteeringNew />
              </Loading>
            ),
          },
          {
            path: 'volunteering/phases/:phaseId/causes/new',
            element: (
              <Loading admin>
                <AdminProjectVolunteeringNew />
              </Loading>
            ),
          },
          {
            path: 'volunteering/causes/:causeId',
            element: (
              <Loading admin>
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
