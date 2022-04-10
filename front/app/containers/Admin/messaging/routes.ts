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
      loader: () => import('./CustomEmails/All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'emails/custom',
      component: Loadable({
        loader: () => import('./CustomEmails/All'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/new',
      component: Loadable({
        loader: () => import('./CustomEmails/New'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId/edit',
      component: Loadable({
        loader: () => import('./CustomEmails/Edit'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/custom/:campaignId',
      component: Loadable({
        loader: () => import('./CustomEmails/Show'),
        loading: () => null,
      }),
    },
    {
      path: 'emails/automated',
      component: Loadable({
        loader: () => import('./AutomatedEmails'),
        loading: () => null,
      }),
    },
    {
      path: 'texting',
      component: Loadable({
        loader: () => import('./texting/CampaignList'),
        loading: () => null,
      }),
    },
    {
      path: 'texting/new',
      component: Loadable({
        loader: () => import('./texting/NewSMSCampaign'),
        loading: () => null,
      }),
    },
    {
      path: 'texting/:campaignId/preview',
      component: Loadable({
        loader: () => import('./texting/SMSCampaignPreview'),
        loading: () => null,
      }),
    },
    {
      path: 'texting/:campaignId',
      component: Loadable({
        loader: () => import('./texting/ExistingSMSCampaign'),
        loading: () => null,
      }),
    },
  ],
});
