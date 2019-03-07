import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'settings',
  name: 'admin settings',
  component: Loadable({
    loader: () => import('containers/Admin/settings'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/settings/general'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: 'general',
      component: Loadable({
        loader: () => import('containers/Admin/settings/general'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'customize',
      component: Loadable({
        loader: () => import('containers/Admin/settings/customize'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'pages',
      component: Loadable({
        loader: () => import('containers/Admin/settings/pages'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'registration',
      component: Loadable({
        loader: () => import('containers/Admin/settings/registration'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: 'widgets',
      component: Loadable({
        loader: () => import('containers/Admin/settings/widgets'),
        loading: LoadableLoadingAdmin
      }),
    },
  ],
});
