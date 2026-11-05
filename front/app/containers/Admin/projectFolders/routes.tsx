import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import Navigate from 'utils/cl-router/Navigate';
import { createRoute, Outlet as RouterOutlet, useParams } from 'utils/router';

import { adminRoute } from '../routes';

const FolderSettings = lazy(() => import('./containers/settings'));
const FolderContainer = lazy(() => import('./containers'));
const FolderProjects = lazy(() => import('./containers/projects'));
const FolderPermissions = lazy(() => import('./containers/permissions'));

const projectFoldersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'projects/folders',
  component: () => (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
});

const projectFoldersNewRoute = createRoute({
  getParentRoute: () => projectFoldersRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <FolderSettings />
    </PageLoading>
  ),
});

const projectFoldersIdRoute = createRoute({
  getParentRoute: () => projectFoldersRoute,
  path: '$projectFolderId',
  component: () => (
    <PageLoading>
      <FolderContainer />
    </PageLoading>
  ),
});

const ProjectFoldersIdDefaultRedirect = () => {
  const { projectFolderId } = useParams({
    from: '/$locale/admin/projects/folders/$projectFolderId',
  });
  return (
    <Navigate
      to="/admin/projects/folders/$projectFolderId/projects"
      params={{ projectFolderId }}
    />
  );
};

const projectFoldersIdDefaultRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: '/',
  component: ProjectFoldersIdDefaultRedirect,
});

const projectFoldersIdProjectsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: 'projects',
  component: () => (
    <PageLoading>
      <FolderProjects />
    </PageLoading>
  ),
});

const projectFoldersIdSettingsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: 'settings',
  component: () => (
    <PageLoading>
      <FolderSettings />
    </PageLoading>
  ),
});

const projectFoldersIdPermissionsRoute = createRoute({
  getParentRoute: () => projectFoldersIdRoute,
  path: 'permissions',
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
