import clusteringsRoutes from './clusterings/routes';

import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  name: 'Admin dashboard',
  path: 'dashboard',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./summary'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: 'users',
      component: Loadable({
        loader: () => import('./users'),
        loading: LoadableLoadingAdmin
      }),
    },
    clusteringsRoutes(),
  /* TODO {
      path: 'dashboard-acquisition',
      getComponent: loadAndRender(import('./acquisition')),
    },*/
    {
      path: 'map',
      component: Loadable({
        loader: () => import('./map'),
        loading: LoadableLoadingAdmin
      }),
    }
  ],
});
