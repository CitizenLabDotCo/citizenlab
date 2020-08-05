import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'emails',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./custom/All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'custom',
      component: Loadable({
        loader: () => import('./custom/All'),
        loading: () => null,
      }),
    },
    {
      path: 'custom/new',
      component: Loadable({
        loader: () => import('./custom/New'),
        loading: () => null,
      }),
    },
    {
      path: 'custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./custom/Edit'),
        loading: () => null,
      }),
    },
    {
      path: 'custom/:campaignId',
      component: Loadable({
        loader: () => import('./custom/Show'),
        loading: () => null,
      }),
    },
    {
      path: 'automated',
      component: Loadable({
        loader: () => import('./automated'),
        loading: () => null,
      }),
    },
  ],
});
