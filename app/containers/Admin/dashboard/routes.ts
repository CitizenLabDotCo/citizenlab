import clusteringsRoutes from './clusterings/routes';

import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  name: 'Admin dashboard',
  path: 'dashboard',
  component: Loadable({
    loader: () => import('./'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./summary'),
      loading: FullPageCenteredSpinner
    }),
  },
  childRoutes: [
    {
      path: 'users',
      component: Loadable({
        loader: () => import('./users'),
        loading: FullPageCenteredSpinner
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
        loading: FullPageCenteredSpinner
      }),
    }
  ],
});
