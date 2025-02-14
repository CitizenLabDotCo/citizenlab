import React, { lazy } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const ProjectLibrary = lazy(() => import('./'));

export enum projectLibraryRoutes {
  projectLibrary = 'project-library',
  projectLibraryDefault = '',
}

export type projectLibraryRouteTypes =
  AdminRoute<projectLibraryRoutes.projectLibrary>;

const toolsRoutes = () => {
  return {
    path: projectLibraryRoutes.projectLibrary,
    element: (
      <PageLoading>
        {/* <HelmetIntl title={messages.projectLibraryLabel} /> */}
        <RouterOutlet />
      </PageLoading>
    ),
    children: [
      {
        path: projectLibraryRoutes.projectLibraryDefault,
        element: (
          <PageLoading>
            <ProjectLibrary />
          </PageLoading>
        ),
      },
    ],
  };
};

export default toolsRoutes;
