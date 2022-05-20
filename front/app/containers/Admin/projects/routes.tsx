import React, { lazy } from 'react';
// import Loadable from 'react-loadable';
// import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
// import moduleConfiguration from 'modules';
const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
import { LoadingComponent } from 'routes';
const AdminProjectEditIndex = lazy(() => import('./edit'));
const AdminProjectEditGeneral = lazy(() => import('./edit/general'));

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
      {
        path: ':projectId',
        children: [
          {
            path: 'edit',
            element: (
              <LoadingComponent>
                <AdminProjectEditIndex />
              </LoadingComponent>
            ),
            children: [
              {
                index: true,
                element: (
                  <LoadingComponent>
                    <AdminProjectEditGeneral />
                  </LoadingComponent>
                ),
              },
            ],
          },
        ],
      },
      //{
      // path: ':projectId/edit',
      // component: Loadable({
      //   loader: () => import('containers/Admin/projects/edit'),
      //   loading: LoadableLoadingAdmin,
      //   delay: 500,
      // }),
      // indexRoute: {
      //   component: Loadable({
      //     loader: () => import('containers/Admin/projects/edit/general'),
      //     loading: () => null,
      //   }),
      // },
      // childRoutes: [
      //   {
      //     path: '/:locale/admin/projects/new',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/general'),
      //       loading: LoadableLoadingAdmin,
      //       delay: 500,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/description',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/description'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/ideas',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/ideas'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/volunteering',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/volunteering'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/volunteering/causes/new',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/volunteering/NewCause'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/volunteering/phases/:phaseId/causes/new',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/volunteering/NewCause'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/volunteering/causes/:causeId',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/volunteering/EditCause'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/timeline',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/timeline'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/timeline/new',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/timeline/edit'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/timeline/:id',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/timeline/edit'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/events',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/events'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/events/new',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/events/edit'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/events/:id',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/events/edit'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/events',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/events'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/permissions',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/permissions'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/survey-results',
      //     component: Loadable({
      //       loader: () =>
      //         import('containers/Admin/projects/edit/surveyResults'),
      //       loading: () => null,
      //     }),
      //   },
      //   {
      //     path: '/:locale/admin/projects/:projectId/poll',
      //     component: Loadable({
      //       loader: () => import('containers/Admin/projects/edit/poll'),
      //       loading: () => null,
      //     }),
      //   },
      //   ...moduleConfiguration.routes['admin.projects'],
      // ],
      // },
      // ...moduleConfiguration.routes['admin.project_templates'],
    ],
  };
};

export default createAdminProjectsRoutes;
