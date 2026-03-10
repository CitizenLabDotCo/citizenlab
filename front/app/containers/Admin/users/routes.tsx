import React, { lazy } from 'react';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdmins = lazy(() => import('./Admins'));
const AdminProjectModerators = lazy(() => import('./ProjectModerators'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
const AdminBannedEmails = lazy(() => import('./BannedEmails'));
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

export enum usersRoutes {
  users = 'users',
  admins = 'admins',
  projectModerators = 'project-moderators',
  groupId = `:groupId`,
  blocked = 'blocked',
  bannedEmails = 'banned-emails',
}

type UsersRoute<T extends string = string> =
  AdminRoute<`${usersRoutes.users}/${T}`>;

export type userRouteTypes =
  | AdminRoute<`${usersRoutes.users}`>
  | UsersRoute<`${usersRoutes.admins}`>
  | UsersRoute<`${usersRoutes.projectModerators}`>
  | UsersRoute<`${usersRoutes.blocked}`>
  | UsersRoute<`${usersRoutes.bannedEmails}`>
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
      path: usersRoutes.admins,
      element: (
        <PageLoading>
          <AdminAdmins />
        </PageLoading>
      ),
    },
    {
      path: usersRoutes.projectModerators,
      element: (
        <PageLoading>
          <AdminProjectModerators />
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
    {
      path: usersRoutes.bannedEmails,
      element: (
        <PageLoading>
          <AdminBannedEmails />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminUsersRoutes;
