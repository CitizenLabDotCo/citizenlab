import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'invitations',
  name: 'admin invitations',
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./invite'),
      loading: () => null
    }),
  },
  childRoutes: [
    {
      path: 'all',
      component: Loadable({
        loader: () => import('./all'),
        loading: () => null
      }),
    },
  ],
});
