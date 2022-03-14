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
      loader: () => import('./emails-custom/All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'emails/custom',
      component: Loadable({
        loader: () => import('./emails-custom/All'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/new',
      component: Loadable({
        loader: () => import('./emails-custom/New'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./emails-custom/Edit'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId',
      component: Loadable({
        loader: () => import('./emails-custom/Show'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/automated',
      component: Loadable({
        loader: () => import('./emails-automated'),
        loading: () => null,
      }),
    },
    {
      path: 'texting',
      component: Loadable({
        loader: () => import('./texting'),
        loading: () => null,
      }),
    },
  ],
});
