import React, { lazy } from 'react';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
import LoadingComponent from 'components/UI/Loading';

const createAdminUsersRoutes = () => ({
  path: 'users',
  element: (
    <LoadingComponent>
      <AdminUsersIndex />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminAllUsers />
        </LoadingComponent>
      ),
    },
    {
      path: ':groupId',
      element: (
        <LoadingComponent>
          <AdminUsersGroup />
        </LoadingComponent>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
