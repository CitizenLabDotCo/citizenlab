import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'users',
  name: 'admin users',
  component: Loadable({
    loader: () => import('containers/Admin/users'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/users/AllUsers'),
      loading: () => null,
    }),
  },
  childRoutes: [
    {
      path: '/:locale/admin/users/:groupId',
      component: Loadable({
        loader: () => import('containers/Admin/users/UsersGroup'),
        loading: () => null,
      }),
    },
  ],
});
