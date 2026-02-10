import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate, Outlet as RouterOutlet } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const FolderSettings = lazy(() => import('./containers/settings'));
const FolderContainer = lazy(() => import('./containers'));
const FolderProjects = lazy(() => import('./containers/projects'));
const FolderPermissions = lazy(() => import('./containers/permissions'));

export enum projectFolderRoutes {
  projectFolders = 'projects/folders',
  new = 'new',
  projectFolderId = `$projectFolderId`,
  projectFolderIdDefault = '/',
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

const projectFoldersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: projectFolderRoutes.projectFolders,
  component: () => (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
});

const projectFoldersNewRoute = createRoute({
  getParentRoute: () => projectFoldersRoute,
  path: projectFolderRoutes.new,
  component: () => (
    <PageLoading>
      <FolderSettings />
    </PageLoading>
  ),
});

const projectFoldersIdRoute = createRoute({
  getParentRoute: () => projectFoldersRoute,
  path: projectFolderRoutes.projectFolderId,
  component: () => (
    <PageLoading>
      <FolderContainer />
    </PageLoading>
  ),
});

const projectFoldersIdDefaultRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: projectFolderRoutes.projectFolderIdDefault,
  component: () => <Navigate to="projects" />,
});

const projectFoldersIdProjectsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: projectFolderRoutes.projects,
  component: () => (
    <PageLoading>
      <FolderProjects />
    </PageLoading>
  ),
});

const projectFoldersIdSettingsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: projectFolderRoutes.settings,
  component: () => (
    <PageLoading>
      <FolderSettings />
    </PageLoading>
  ),
});

const projectFoldersIdPermissionsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: projectFolderRoutes.permissions,
  component: () => (
    <PageLoading>
      <FolderPermissions />
    </PageLoading>
  ),
});

const createProjectFoldersRoutes = () => {
  return projectFoldersRoute.addChildren([
    projectFoldersNewRoute,
    projectFoldersIdRoute.addChildren([
      projectFoldersIdDefaultRoute,
      projectFoldersIdProjectsRoute,
      projectFoldersIdSettingsRoute,
      projectFoldersIdPermissionsRoute,
    ]),
  ]);
};

export default createProjectFoldersRoutes;
