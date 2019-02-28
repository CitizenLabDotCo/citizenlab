import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'emails',
  component: Loadable({
    loader: () => import('./'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./custom/All'),
      loading: FullPageCenteredSpinner
    }),
  },
  childRoutes: [
    {
      path: 'custom',
      component: Loadable({
        loader: () => import('./custom/All'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'custom/new',
      component: Loadable({
        loader: () => import('./custom/New'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./custom/Edit'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'custom/:campaignId',
      component: Loadable({
        loader: () => import('./custom/Show'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'automated',
      component: Loadable({
        loader: () => import('./automated'),
        loading: FullPageCenteredSpinner
      }),
    },
  ],
});
