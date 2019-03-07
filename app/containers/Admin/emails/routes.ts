import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'emails',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./custom/All'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: 'custom',
      component: Loadable({
        loader: () => import('./custom/All'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'custom/new',
      component: Loadable({
        loader: () => import('./custom/New'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./custom/Edit'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'custom/:campaignId',
      component: Loadable({
        loader: () => import('./custom/Show'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'automated',
      component: Loadable({
        loader: () => import('./automated'),
        loading: LoadableLoadingAdmin
      }),
    },
  ],
});
