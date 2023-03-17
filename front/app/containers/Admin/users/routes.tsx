import React, { lazy } from 'react';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
import PageLoading from 'components/UI/PageLoading';

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
    {
      path: 'blocked',
      element: (
        <PageLoading>
          <AdminBlockedUsers />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
