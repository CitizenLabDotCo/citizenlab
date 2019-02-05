// import loadAndRender from 'utils/loadAndRender';
import clusteringsRoutes from './clusterings/routes';

import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  name: 'Admin dashboard',
  path: 'dashboard',
  component: Loadable({
    loader: () => import('./'),
    loading: Spinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./summary'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: 'users',
      component: Loadable({
        loader: () => import('./users'),
        loading: Spinner
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
        loading: Spinner
      }),
    }
  ],
});
