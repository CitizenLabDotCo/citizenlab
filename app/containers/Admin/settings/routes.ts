import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import topicsRoutes from './topics/routes';
import moduleConfiguration from 'modules';

export default () => ({
  path: 'settings',
  name: 'admin settings',
  component: Loadable({
    loader: () => import('containers/Admin/settings'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/settings/general'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'general',
      component: Loadable({
        loader: () => import('containers/Admin/settings/general'),
        loading: () => null,
      }),
    },
    {
      path: 'customize',
      component: Loadable({
        loader: () => import('containers/Admin/settings/customize'),
        loading: () => null,
      }),
    },
    {
      path: 'pages',
      component: Loadable({
        loader: () => import('containers/Admin/settings/pages'),
        loading: () => null,
      }),
    },
    ...moduleConfiguration.routes['admin.settings'],
    topicsRoutes(),
    {
      path: 'widgets',
      component: Loadable({
        loader: () => import('containers/Admin/settings/widgets'),
        loading: () => null,
      }),
    },
  ],
});
