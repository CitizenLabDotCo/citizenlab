import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

const LiveMonitor = lazy(() => import('./components/LiveMonitor'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const Participants = lazy(() => import('./components/Participants'));

import { AdminRoute } from '../routes';

const CommunityMonitor = lazy(() => import('./index'));

export enum communityMonitorRoutes {
  communityMonitorDefault = '',
  communityMonitor = 'community-monitor',
  liveMonitor = 'live-monitor',
  participants = 'participants',
  reports = 'reports',
  settings = 'settings',
}

export type communityMonitorRouteTypes =
  | AdminRoute<communityMonitorRoutes.communityMonitor>
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.liveMonitor}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.participants}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.reports}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}`;

const communityMonitorsRoutes = () => {
  return {
    path: communityMonitorRoutes.communityMonitor,
    element: (
      <PageLoading>
        <CommunityMonitor />
      </PageLoading>
    ),
    children: [
      {
        path: communityMonitorRoutes.liveMonitor,
        element: (
          <PageLoading>
            <div
              role="tabpanel"
              aria-labelledby="tab-live-monitor"
              tabIndex={0}
            >
              <LiveMonitor />
            </div>
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.reports,
        element: (
          <PageLoading>
            <div role="tabpanel" aria-labelledby="tab-reports" tabIndex={0}>
              <Reports />
            </div>
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.settings,
        element: (
          <PageLoading>
            <div role="tabpanel" aria-labelledby="tab-settings" tabIndex={0}>
              <Settings />
            </div>
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.participants,
        element: (
          <PageLoading>
            <div
              role="tabpanel"
              aria-labelledby="tab-participants"
              tabIndex={0}
            >
              <Participants />
            </div>
          </PageLoading>
        ),
      },
    ],
  };
};

export default communityMonitorsRoutes;
