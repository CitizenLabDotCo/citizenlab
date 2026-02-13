import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdmins = lazy(() => import('./Admins'));
const AdminModerators = lazy(() => import('./Moderators'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
const AdminBannedEmails = lazy(() => import('./BannedEmails'));

const usersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
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
  path: 'admins',
  component: () => (
    <PageLoading>
      <AdminAdmins />
    </PageLoading>
  ),
});

const moderatorsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'moderators',
  component: () => (
    <PageLoading>
      <AdminModerators />
    </PageLoading>
  ),
});

const groupRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '$groupId',
  component: () => (
    <PageLoading>
      <AdminUsersGroup />
    </PageLoading>
  ),
});

const blockedRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'blocked',
  component: () => (
    <PageLoading>
      <AdminBlockedUsers />
    </PageLoading>
  ),
});

const bannedEmailsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'banned-emails',
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
