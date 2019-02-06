import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'users',
  name: 'admin users',
  component: Loadable({
    loader: () => import('containers/Admin/users'),
    loading: Spinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/users/AllUsers'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: '/:locale/admin/users/:groupId',
      component: Loadable({
        loader: () => import('containers/Admin/users/UsersGroup'),
        loading: Spinner
      }),
    },
  ],
});
