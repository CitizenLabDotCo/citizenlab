import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./tabs/AllUsers'));
const AdminAdmins = lazy(() => import('./tabs/Admins'));
const AdminSpaceModerators = lazy(() => import('./tabs/SpaceModerators'));
const AdminFolderModerators = lazy(() => import('./tabs/FolderModerators'));
const AdminProjectModerators = lazy(() => import('./tabs/ProjectModerators'));
const AdminBlockedUsers = lazy(() => import('./tabs/BlockedUsers'));
const AdminBannedEmails = lazy(() => import('./tabs/BannedEmails'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminSeatsOverview = lazy(() => import('./SeatsOverview'));

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

const spaceModeratorsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'space-moderators',
  component: () => (
    <PageLoading>
      <AdminSpaceModerators />
    </PageLoading>
  ),
});

const folderModeratorsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'folder-moderators',
  component: () => (
    <PageLoading>
      <AdminFolderModerators />
    </PageLoading>
  ),
});

const projectModeratorsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'project-moderators',
  component: () => (
    <PageLoading>
      <AdminProjectModerators />
    </PageLoading>
  ),
});

const groupRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'groups/$groupId',
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

const seatsRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: 'seats',
  component: () => (
    <PageLoading>
      <AdminSeatsOverview />
    </PageLoading>
  ),
});

const createAdminUsersRoutes = () => {
  return usersRoute.addChildren([
    usersIndexRoute,
    adminsRoute,
    spaceModeratorsRoute,
    folderModeratorsRoute,
    projectModeratorsRoute,
    groupRoute,
    blockedRoute,
    bannedEmailsRoute,
    seatsRoute,
  ]);
};

export default createAdminUsersRoutes;
