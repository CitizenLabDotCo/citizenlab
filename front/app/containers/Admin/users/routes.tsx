import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdmins = lazy(() => import('./Admins'));
const AdminModerators = lazy(() => import('./Moderators'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
const AdminBannedEmails = lazy(() => import('./BannedEmails'));

export enum usersRoutes {
  users = 'users',
  admins = 'admins',
  moderators = 'moderators',
  groupId = `$groupId`,
  blocked = 'blocked',
  bannedEmails = 'banned-emails',
}

type UsersRoute<T extends string = string> =
  AdminRoute<`${usersRoutes.users}/${T}`>;

export type userRouteTypes =
  | AdminRoute<`${usersRoutes.users}`>
  | UsersRoute<`${usersRoutes.admins}`>
  | UsersRoute<`${usersRoutes.moderators}`>
  | UsersRoute<`${usersRoutes.blocked}`>
  | UsersRoute<`${usersRoutes.bannedEmails}`>
  | UsersRoute<`${string}`>;

const usersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: usersRoutes.users,
  component: () => (
    <PageLoading>
      <AdminUsersIndex />
    </PageLoading>
  ),
});

const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminAllUsers />
    </PageLoading>
  ),
});

const adminsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: usersRoutes.admins,
  component: () => (
    <PageLoading>
      <AdminAdmins />
    </PageLoading>
  ),
});

const moderatorsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: usersRoutes.moderators,
  component: () => (
    <PageLoading>
      <AdminModerators />
    </PageLoading>
  ),
});

const groupRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: usersRoutes.groupId,
  component: () => (
    <PageLoading>
      <AdminUsersGroup />
    </PageLoading>
  ),
});

const blockedRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: usersRoutes.blocked,
  component: () => (
    <PageLoading>
      <AdminBlockedUsers />
    </PageLoading>
  ),
});

const bannedEmailsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: usersRoutes.bannedEmails,
  component: () => (
    <PageLoading>
      <AdminBannedEmails />
    </PageLoading>
  ),
});

const createAdminUsersRoutes = () => {
  return usersRoute.addChildren([
    usersIndexRoute,
    adminsRoute,
    moderatorsRoute,
    groupRoute,
    blockedRoute,
    bannedEmailsRoute,
  ]);
};

export default createAdminUsersRoutes;
