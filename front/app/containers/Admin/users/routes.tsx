import React, { lazy } from 'react';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
import Loading from 'components/UI/Loading';

const createAdminUsersRoutes = () => ({
  path: 'users',
  element: (
    <Loading admin>
      <AdminUsersIndex />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading admin>
          <AdminAllUsers />
        </Loading>
      ),
    },
    {
      path: ':groupId',
      element: (
        <Loading admin>
          <AdminUsersGroup />
        </Loading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
