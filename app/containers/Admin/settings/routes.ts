import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'settings',
  name: 'admin settings',
  component: Loadable({
    loader: () => import('containers/Admin/settings'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/settings/general'),
      loading: FullPageCenteredSpinner
    }),
  },
  childRoutes: [
    {
      path: 'general',
      component: Loadable({
        loader: () => import('containers/Admin/settings/general'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'customize',
      component: Loadable({
        loader: () => import('containers/Admin/settings/customize'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'pages',
      component: Loadable({
        loader: () => import('containers/Admin/settings/pages'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'registration',
      component: Loadable({
        loader: () => import('containers/Admin/settings/registration'),
        loading: FullPageCenteredSpinner
      }),
    },
    {
      path: 'widgets',
      component: Loadable({
        loader: () => import('containers/Admin/settings/widgets'),
        loading: FullPageCenteredSpinner
      }),
    },
  ],
});
