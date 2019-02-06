import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'settings',
  name: 'admin settings',
  component: Loadable({
    loader: () => import('containers/Admin/settings'),
    loading: Spinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/settings/general'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: 'general',
      component: Loadable({
        loader: () => import('containers/Admin/settings/general'),
        loading: Spinner
      }),
    },
    {
      path: 'customize',
      component: Loadable({
        loader: () => import('containers/Admin/settings/customize'),
        loading: Spinner
      }),
    },
    {
      path: 'pages',
      component: Loadable({
        loader: () => import('containers/Admin/settings/pages'),
        loading: Spinner
      }),
    },
    {
      path: 'registration',
      component: Loadable({
        loader: () => import('containers/Admin/settings/registration'),
        loading: Spinner
      }),
    },
    {
      path: 'widgets',
      component: Loadable({
        loader: () => import('containers/Admin/settings/widgets'),
        loading: Spinner
      }),
    },
  ],
});
