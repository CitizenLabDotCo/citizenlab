import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'emails',
  component: Loadable({
    loader: () => import('./'),
    loading: Spinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./custom/All'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: 'custom',
      component: Loadable({
        loader: () => import('./custom/All'),
        loading: Spinner
      }),
    },
    {
      path: 'custom/new',
      component: Loadable({
        loader: () => import('./custom/New'),
        loading: Spinner
      }),
    },
    {
      path: 'custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./custom/Edit'),
        loading: Spinner
      }),
    },
    {
      path: 'custom/:campaignId',
      component: Loadable({
        loader: () => import('./custom/Show'),
        loading: Spinner
      }),
    },
    {
      path: 'automated',
      component: Loadable({
        loader: () => import('./automated'),
        loading: Spinner
      }),
    },
  ],
});
