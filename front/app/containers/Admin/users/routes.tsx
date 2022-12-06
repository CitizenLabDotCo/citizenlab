import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));

const createAdminUsersRoutes = () => ({
  path: 'users',
  element: (
    <PageLoading>
      <AdminUsersIndex />
    </PageLoading>
  ),
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <AdminAllUsers />
        </PageLoading>
      ),
    },
    {
      path: ':groupId',
      element: (
        <PageLoading>
          <AdminUsersGroup />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
