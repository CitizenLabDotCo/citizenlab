import { lazy } from 'react';
// import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));

const createAdminUsersRoutes = () => ({
  path: 'users',
  element: AdminUsersIndex,
  children: [
    {
      index: true,
      path: '',
      element: AdminAllUsers,
    },
    {
      path: ':groupId',
      element: AdminUsersGroup,
    },
  ],
});

export default createAdminUsersRoutes;
