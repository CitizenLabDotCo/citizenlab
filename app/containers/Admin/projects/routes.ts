import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'projects',
  name: 'admin projects',
  component: Loadable({
    loader: () => import('containers/Admin/projects'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    name: 'admin projects index',
    component: Loadable({
      loader: () => import('containers/Admin/projects/all'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: ':projectId/edit',
      name: 'admin projects single project',
      component: Loadable({
        loader: () => import('containers/Admin/projects/edit'),
        loading: LoadableLoadingAdmin
      }),
      indexRoute: {
        name: 'admin projects single edit',
        component: Loadable({
          loader: () => import('containers/Admin/projects/edit/general'),
          loading: LoadableLoadingAdmin
        }),
      },
      childRoutes: [
        {
          path: '/:locale/admin/projects/:projectId/description',
          name: 'admin projects description',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/description'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/ideas',
          name: 'admin projects ideas manager',
          component: Loadable({
            loader: () => import('components/admin/IdeaManager'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/timeline',
          name: 'admin projects timeline',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/timeline'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/timeline/new',
          name: 'admin projects timeline create',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/timeline/edit'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/timeline/:id',
          name: 'admin projects timeline edit',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/timeline/edit'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/events',
          name: 'admin projects events',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/events'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/events/new',
          name: 'admin projects events create',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/events/edit'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/events/:id',
          name: 'admin projects events edit',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/events/edit'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/new',
          name: 'admin projects create new',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/general'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/events',
          name: 'admin projects edit events',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/events'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: '/:locale/admin/projects/:projectId/permissions',
          name: 'admin projects edit permissions',
          component: Loadable({
            loader: () => import('containers/Admin/projects/edit/permissions'),
            loading: LoadableLoadingAdmin
          }),
        },
      ],
    },
  ],
});
