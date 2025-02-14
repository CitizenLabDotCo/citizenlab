import React, { lazy } from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import messages from './messages';

const CommunityMonitor = lazy(() => import('./index'));

export enum communityMonitorRoutes {
  communityMonitor = 'community-monitor',
  communityMonitorDefault = '',
}

export type communityMonitorRouteTypes =
  AdminRoute<communityMonitorRoutes.communityMonitor>;

const communityMonitorsRoutes = () => {
  return {
    path: communityMonitorRoutes.communityMonitor,
    element: (
      <PageLoading>
        <HelmetIntl title={messages.communityMonitorLabel} />
        <RouterOutlet />
      </PageLoading>
    ),
    children: [
      {
        path: communityMonitorRoutes.communityMonitorDefault,
        element: (
          <PageLoading>
            <CommunityMonitor />
          </PageLoading>
        ),
      },
    ],
  };
};

export default communityMonitorsRoutes;
