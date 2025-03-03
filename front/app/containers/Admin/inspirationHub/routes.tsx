import React, { lazy } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const InspirationHub = lazy(() => import('.'));

export enum inspirationHubRoutes {
  inspirationHub = 'inspiration-hub',
  inspirationHubDefault = '',
}

export type inspirationHubRouteTypes =
  AdminRoute<inspirationHubRoutes.inspirationHub>;

const toolsRoutes = () => {
  return {
    path: inspirationHubRoutes.inspirationHub,
    element: (
      <PageLoading>
        <RouterOutlet />
      </PageLoading>
    ),
    children: [
      {
        path: inspirationHubRoutes.inspirationHubDefault,
        element: (
          <PageLoading>
            <InspirationHub />
          </PageLoading>
        ),
      },
    ],
  };
};

export default toolsRoutes;
