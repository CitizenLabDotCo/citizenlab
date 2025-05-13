import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const DashboardContainer = React.lazy(
  () => import('../Representativeness/Dashboard')
);

const ReferenceDataInterface = React.lazy(
  () => import('../Representativeness/ReferenceDataInterface')
);

const AdminModerationComponent = React.lazy(
  () => import('containers/Admin/Moderation')
);

const DashboardWrapper = lazy(() => import('.'));
const Overview = lazy(() => import('./overview'));
const Users = lazy(() => import('./users'));
const Visitors = lazy(() => import('./visitors'));
const ManagementFeed = lazy(() => import('./ManagementFeed'));

export enum dashboardRoutes {
  dashboard = 'dashboard',
  overview = 'overview',
  users = 'users',
  visitors = 'visitors',
  management_feed = 'management-feed',
  moderation = 'moderation',
  representation = 'representation',
}

export enum moderationRoutes {
  moderation = 'moderation',
}

export enum representativenessRoutes {
  representation = 'representation',
  editBaseData = `representation/edit-base-data`,
}

export type dashboardRouteTypes =
  | AdminRoute<dashboardRoutes.dashboard>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.overview}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.users}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.visitors}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.management_feed}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.moderation}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.representation}`>
  | AdminRoute<`dashboard/${representativenessRoutes.representation}`>
  | AdminRoute<`dashboard/${representativenessRoutes.editBaseData}`>
  | AdminRoute<`dashboard/${moderationRoutes.moderation}`>;

const createAdminDashboardRoutes = () => {
  return {
    path: dashboardRoutes.dashboard,
    element: (
      <PageLoading>
        <DashboardWrapper />
      </PageLoading>
    ),
    children: [
      {
        path: dashboardRoutes.overview,
        element: (
          <PageLoading>
            <Overview />
          </PageLoading>
        ),
      },
      {
        path: dashboardRoutes.users,
        element: (
          <PageLoading>
            <Users />
          </PageLoading>
        ),
      },
      {
        path: dashboardRoutes.visitors,
        element: (
          <PageLoading>
            <Visitors />
          </PageLoading>
        ),
      },
      {
        path: dashboardRoutes.management_feed,
        element: (
          <PageLoading>
            <ManagementFeed />
          </PageLoading>
        ),
      },
      {
        path: representativenessRoutes.representation,
        element: <DashboardContainer />,
      },
      {
        path: representativenessRoutes.editBaseData,
        element: <ReferenceDataInterface />,
      },
      {
        path: moderationRoutes.moderation,
        element: <AdminModerationComponent />,
      },
    ],
  };
};

export default createAdminDashboardRoutes;
