import React, { lazy } from 'react';

import { Navigate, Outlet as RouterOutlet } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const FolderSettings = lazy(() => import('./containers/settings'));
const FolderContainer = lazy(() => import('./containers'));
const FolderProjects = lazy(() => import('./containers/projects'));
const FolderPermissions = lazy(() => import('./containers/permissions'));

export enum projectFolderRoutes {
  projectFolders = 'projects/folders',
  new = 'new',
  projectFolderId = `:projectFolderId`,
  projectFolderIdDefault = '',
  settings = `settings`,
  projects = `projects`,
  permissions = `permissions`,
}

export type projectFolderRouteTypes =
  | AdminRoute<projectFolderRoutes.projectFolders>
  | AdminRoute<`${projectFolderRoutes.projectFolders}/${projectFolderRoutes.new}`>
  | AdminRoute<`${projectFolderRoutes.projectFolders}/${string}`>
  | AdminRoute<`${projectFolderRoutes.projectFolders}/${string}/${projectFolderRoutes.projects}`>
  | AdminRoute<`${projectFolderRoutes.projectFolders}/${string}/${projectFolderRoutes.settings}`>
  | AdminRoute<`${projectFolderRoutes.projectFolders}/${string}/${projectFolderRoutes.permissions}`>;

export default () => ({
  path: projectFolderRoutes.projectFolders,
  element: (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
  children: [
    {
      path: projectFolderRoutes.new,
      element: <FolderSettings />,
    },
    {
      path: projectFolderRoutes.projectFolderId,
      element: <FolderContainer />,
      children: [
        {
          path: projectFolderRoutes.projectFolderIdDefault,
          element: <Navigate to="projects" />,
        },
        {
          path: projectFolderRoutes.projects,
          element: <FolderProjects />,
        },
        {
          path: projectFolderRoutes.settings,
          element: <FolderSettings />,
        },
        {
          path: projectFolderRoutes.permissions,
          element: <FolderPermissions />,
        },
      ],
    },
  ],
});
