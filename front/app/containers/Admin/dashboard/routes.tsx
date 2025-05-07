import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';
import Visitors from './visitors';

const DashboardWrapper = lazy(() => import('.'));
const Overview = lazy(() => import('./overview'));
const Users = lazy(() => import('./users'));
const ManagementFeed = lazy(() => import('./ManagementFeed'));

export enum dashboardRoutes {
  dashboard = 'dashboard',
  overview = 'overview',
  users = 'users',
  visitors = 'visitors',
  management_feed = 'management-feed',
}

export type dashboardRouteTypes =
  | AdminRoute<dashboardRoutes.dashboard>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.overview}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.users}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.visitors}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.management_feed}`>;

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
    ],
  };
};

export default createAdminDashboardRoutes;
