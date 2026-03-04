import React, { lazy } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const NewSpace = lazy(() => import('./NewSpace'));
const EditSpace = lazy(() => import('./EditSpace'));
const ProjectsAndFolders = lazy(() => import('./EditSpace/ProjectsAndFolders'));
const Settings = lazy(() => import('./EditSpace/Settings'));

export enum spacesRoutes {
  spaces = 'projects/spaces',
  new = 'new',
  spaceId = ':spaceId',
  settings = 'settings',
}

export type spaceRouteTypes =
  | AdminRoute<spacesRoutes.spaces>
  | AdminRoute<`${spacesRoutes.spaces}/${spacesRoutes.new}`>
  | AdminRoute<`${spacesRoutes.spaces}/${string}`>
  | AdminRoute<`${spacesRoutes.spaces}/${string}/${spacesRoutes.settings}`>;

export default () => ({
  path: spacesRoutes.spaces,
  element: (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
  children: [
    {
      path: spacesRoutes.new,
      element: (
        <PageLoading>
          <NewSpace />
        </PageLoading>
      ),
    },
    {
      path: spacesRoutes.spaceId,
      element: (
        <PageLoading>
          <EditSpace />
        </PageLoading>
      ),
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <ProjectsAndFolders />
            </PageLoading>
          ),
        },
        {
          path: spacesRoutes.settings,
          element: (
            <PageLoading>
              <Settings />
            </PageLoading>
          ),
        },
      ],
    },
  ],
});
