import React, { lazy } from 'react';
import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import moduleConfiguration from 'modules';
const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
import { LoadingComponent } from 'routes';

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
        element: (
          <LoadingComponent>
            <AdminProjectsList />
          </LoadingComponent>
        ),
        index: true,
      },
      // ...moduleConfiguration.routes['admin.project_templates'],
      {
        path: ':projectId/edit',
        name: 'admin projects single project',
        component: Loadable({
          loader: () => import('containers/Admin/projects/edit'),
          loading: LoadableLoadingAdmin,
          delay: 500,
        }),
        indexRoute: {
          name: 'admin projects single edit',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/general'),
            loading: () => null,
          }),
        },
        childRoutes: [
          {
            path: '/:locale/admin/projects/new',
            name: 'admin projects create new',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/general'),
              loading: LoadableLoadingAdmin,
              delay: 500,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/description',
            name: 'admin projects description',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/description'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/ideas',
            name: 'admin projects ideas manager',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/ideas'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/volunteering',
            name: 'admin projects volunteering',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/volunteering'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/volunteering/causes/new',
            name: 'admin projects make a new cause in a project',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/volunteering/NewCause'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/volunteering/phases/:phaseId/causes/new',
            name: 'admin projects make a new cause in a phase',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/volunteering/NewCause'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/volunteering/causes/:causeId',
            name: 'admin projects timeline edit',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/volunteering/EditCause'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/timeline',
            name: 'admin projects timeline',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/timeline'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/timeline/new',
            name: 'admin projects timeline create',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/timeline/edit'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/timeline/:id',
            name: 'admin projects timeline edit',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/timeline/edit'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/events',
            name: 'admin projects events',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/events'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/events/new',
            name: 'admin projects events create',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/events/edit'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/events/:id',
            name: 'admin projects events edit',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/events/edit'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/events',
            name: 'admin projects edit events',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/events'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/permissions',
            name: 'admin projects edit permissions',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/permissions'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/survey-results',
            name: 'admin projects edit survey results',
            component: Loadable({
              loader: () =>
                import('containers/Admin/projects/edit/surveyResults'),
              loading: () => null,
            }),
          },
          {
            path: '/:locale/admin/projects/:projectId/poll',
            name: 'admin projects edit poll',
            component: Loadable({
              loader: () => import('containers/Admin/projects/edit/poll'),
              loading: () => null,
            }),
          },
          ...moduleConfiguration.routes['admin.projects'],
        ],
      },
    ],
  };
};

export default createAdminProjectsRoutes;
