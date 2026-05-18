import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Outlet } from 'utils/router';

import { adminRoute } from '../routes';

const NewSpace = lazy(() => import('./NewSpace'));
const EditSpace = lazy(() => import('./EditSpace'));
const ProjectsAndFolders = lazy(() => import('./EditSpace/ProjectsAndFolders'));
const Settings = lazy(() => import('./EditSpace/Settings'));

const spacesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'projects/spaces',
  component: () => (
    <PageLoading>
      <Outlet />
    </PageLoading>
  ),
});

const newSpaceRoute = createRoute({
  getParentRoute: () => spacesRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <NewSpace />
    </PageLoading>
  ),
});

const editSpaceRoute = createRoute({
  getParentRoute: () => spacesRoute,
  path: '$spaceId',
  component: () => (
    <PageLoading>
      <EditSpace />
    </PageLoading>
  ),
});

const editSpaceIndexRoute = createRoute({
  getParentRoute: () => editSpaceRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <ProjectsAndFolders />
    </PageLoading>
  ),
});

const editSpaceSettingsRoute = createRoute({
  getParentRoute: () => editSpaceRoute,
  path: 'settings',
  component: () => (
    <PageLoading>
      <Settings />
    </PageLoading>
  ),
});

const createAdminSpacesRoutes = () => {
  return spacesRoute.addChildren([
    newSpaceRoute,
    editSpaceRoute.addChildren([editSpaceIndexRoute, editSpaceSettingsRoute]),
  ]);
};

export default createAdminSpacesRoutes;
