import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import moduleConfiguration from 'modules';

export default () => ({
  name: 'Admin initiatives',
  path: 'initiatives',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./settings'),
      loading: () => null,
    }),
  },
  childRoutes: [
    {
      path: 'manage',
      component: Loadable({
        loader: () => import('./manage'),
        loading: () => null,
      }),
    },
    ...moduleConfiguration.routes['admin.initiatives'],
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
