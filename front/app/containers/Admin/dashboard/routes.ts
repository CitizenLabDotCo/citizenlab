import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import moduleConfiguration from 'modules';

export default () => ({
  name: 'Admin dashboard',
  path: 'dashboard',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./summary'),
      loading: () => null,
    }),
  },
  childRoutes: [
    {
      path: 'users',
      component: Loadable({
        loader: () => import('./users'),
        loading: () => null,
      }),
    },
    {
      path: 'reports',
      indexRoute: {
        component: Loadable({
          loader: () => import('./reports'),
          loading: () => null,
        }),
      },
      childRoutes: [
        {
          path: ':projectId',
          component: Loadable({
            loader: () => import('./reports/ProjectReport'),
            loading: () => null,
          }),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.dashboards'],
  ],
});
