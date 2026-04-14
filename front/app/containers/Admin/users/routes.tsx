import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

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

export enum usersRoutes {
  users = 'users',
  admins = 'admins',
  spaceModerators = 'space-moderators',
  folderModerators = 'folder-moderators',
  projectModerators = 'project-moderators',
  groups = 'groups',
  groupId = `:groupId`,
  blocked = 'blocked',
  bannedEmails = 'banned-emails',
  seats = 'seats',
}

type UsersRoute<T extends string = string> =
  AdminRoute<`${usersRoutes.users}/${T}`>;

export type userRouteTypes =
  | AdminRoute<`${usersRoutes.users}`>
  | UsersRoute<`${usersRoutes.admins}`>
  | UsersRoute<`${usersRoutes.spaceModerators}`>
  | UsersRoute<`${usersRoutes.folderModerators}`>
  | UsersRoute<`${usersRoutes.projectModerators}`>
  | UsersRoute<`${usersRoutes.blocked}`>
  | UsersRoute<`${usersRoutes.bannedEmails}`>
  | UsersRoute<`${usersRoutes.seats}`>
  | UsersRoute<`${usersRoutes.groups}/${string}`>;

const createAdminUsersRoutes = () => [
  {
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
        path: usersRoutes.spaceModerators,
        element: (
          <PageLoading>
            <AdminSpaceModerators />
          </PageLoading>
        ),
      },
      {
        path: usersRoutes.folderModerators,
        element: (
          <PageLoading>
            <AdminFolderModerators />
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
      {
        path: `${usersRoutes.groups}/${usersRoutes.groupId}`,
        element: (
          <PageLoading>
            <AdminUsersGroup />
          </PageLoading>
        ),
      },
    ],
  },
  {
    path: `${usersRoutes.users}/${usersRoutes.seats}`,
    element: (
      <PageLoading>
        <AdminSeatsOverview />
      </PageLoading>
    ),
  },
];

export default createAdminUsersRoutes;
