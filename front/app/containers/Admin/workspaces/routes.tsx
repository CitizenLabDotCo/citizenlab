import React from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

export enum workspaceRoutes {
  workspaces = 'projects/workspaces',
  new = 'new',
  workspaceId = `:workspaceId`,
}

export type workspaceRouteTypes =
  | AdminRoute<workspaceRoutes.workspaces>
  | AdminRoute<`${workspaceRoutes.workspaces}/${workspaceRoutes.new}`>
  | AdminRoute<`${workspaceRoutes.workspaces}/${string}`>;

export default () => ({
  path: workspaceRoutes.workspaces,
  element: (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
  children: [
    {
      path: workspaceRoutes.new,
      element: <></>,
    },
    {
      path: workspaceRoutes.workspaceId,
      element: <></>,
    },
  ],
});
