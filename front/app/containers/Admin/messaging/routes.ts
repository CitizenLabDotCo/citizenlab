import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'messaging',
  component: Loadable({
    loader: () => import('.'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./EmailsCustom/All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'emails/custom',
      component: Loadable({
        loader: () => import('./EmailsCustom/All'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/new',
      component: Loadable({
        loader: () => import('./EmailsCustom/New'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./EmailsCustom/Edit'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId',
      component: Loadable({
        loader: () => import('./EmailsCustom/Show'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/automated',
      component: Loadable({
        loader: () => import('./EmailsAutomated'),
        loading: () => null,
      }),
    },
  ],
});
