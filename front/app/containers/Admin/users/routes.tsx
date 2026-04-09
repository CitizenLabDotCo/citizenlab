import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const AdminUsersIndex = lazy(() => import('.'));
const AdminAllUsers = lazy(() => import('./AllUsers'));
const AdminAdmins = lazy(() => import('./Admins'));
const AdminFolderModerators = lazy(() => import('./FolderModerators'));
const AdminProjectModerators = lazy(() => import('./ProjectModerators'));
const AdminUsersGroup = lazy(() => import('./UsersGroup'));
const AdminBlockedUsers = lazy(() => import('./BlockedUsers'));
const AdminBannedEmails = lazy(() => import('./BannedEmails'));
const AdminSeatsOverview = lazy(() => import('./SeatsOverview'));

export enum usersRoutes {
  users = 'users',
  admins = 'admins',
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
