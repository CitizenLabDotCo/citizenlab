import React, { lazy } from 'react';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
import Loading from 'components/UI/Loading';

const createAdminUsersRoutes = () => ({
  path: 'users',
  element: (
    <Loading>
      <AdminUsersIndex />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading>
          <AdminAllUsers />
        </Loading>
      ),
    },
    {
      path: ':groupId',
      element: (
        <Loading>
          <AdminUsersGroup />
        </Loading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
