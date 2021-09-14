import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
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
      path: 'navigation',
      component: Loadable({
        loader: () => import('containers/Admin/settings/navigation'),
        loading: () => null,
      }),
    },
    {
      path: 'policies',
      component: Loadable({
        loader: () => import('containers/Admin/settings/policies'),
        loading: () => null,
      }),
    },
    {
      path: 'registration',
      component: Loadable({
        loader: () => import('containers/Admin/settings/registration'),
        loading: () => null,
      }),
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
