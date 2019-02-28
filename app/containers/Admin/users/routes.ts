import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'users',
  name: 'admin users',
  component: Loadable({
    loader: () => import('containers/Admin/users'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('containers/Admin/users/AllUsers'),
      loading: FullPageCenteredSpinner
    }),
  },
  childRoutes: [
    {
      path: '/:locale/admin/users/:groupId',
      component: Loadable({
        loader: () => import('containers/Admin/users/UsersGroup'),
        loading: FullPageCenteredSpinner
      }),
    },
  ],
});
