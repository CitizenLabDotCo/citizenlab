import React, { lazy } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';
import sidebarMessages from '../sideBar/messages';

import messages from './messages';

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
        <HelmetIntl
          title={sidebarMessages.inspirationHub}
          description={messages.inspirationHubDescription}
        />
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
