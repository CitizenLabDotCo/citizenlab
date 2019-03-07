import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'users',
  name: 'admin users',
  component: Loadable({
    loader: () => import('containers/Admin/users'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/users/AllUsers'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: '/:locale/admin/users/:groupId',
      component: Loadable({
        loader: () => import('containers/Admin/users/UsersGroup'),
        loading: LoadableLoadingAdmin
      }),
    },
  ],
});
