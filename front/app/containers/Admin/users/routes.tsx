import React, { lazy } from 'react';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdminsAndManagers = lazy(() => import('./AdminsAndModerators'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

enum usersRoutes {
  users = 'users',
  adminsManagers = 'admins-managers',
  groupId = `:groupId`,
  blocked = 'blocked',
}

type UsersRoute<T extends string = string> =
  AdminRoute<`${usersRoutes.users}/${T}/`>;

export type userRouteTypes =
  | UsersRoute<usersRoutes.users>
  | UsersRoute<`${usersRoutes.adminsManagers}`>
  | UsersRoute<`${usersRoutes.blocked}`>
  | UsersRoute<`${string}`>;

const createAdminUsersRoutes = () => ({
  path: usersRoutes.users,
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
      path: usersRoutes.adminsManagers,
      element: (
        <PageLoading>
          <AdminAdminsAndManagers />
        </PageLoading>
      ),
    },
    {
      path: usersRoutes.groupId,
      element: (
        <PageLoading>
          <AdminUsersGroup />
        </PageLoading>
      ),
    },
    {
      path: usersRoutes.blocked,
      element: (
        <PageLoading>
          <AdminBlockedUsers />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
