import React, { lazy } from 'react';
const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdminsAndManagers = lazy(() => import('./AdminsAndManagers'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
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
      path: 'admins-managers',
      element: (
        <PageLoading>
          <AdminAdminsAndManagers />
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
