import React, { lazy } from 'react';

import moduleConfiguration from 'modules';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';
const DashboardWrapper = lazy(() => import('.'));
const Overview = lazy(() => import('./overview'));
const Users = lazy(() => import('./users'));

enum dashboardRoutes {
  dashboard = 'dashboard',
  overview = 'overview',
  users = 'users',
}

export type dashboardRouteTypes =
  | AdminRoute<dashboardRoutes.dashboard>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.overview}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.users}`>;

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
      ...moduleConfiguration.routes['admin.dashboards'],
    ],
  };
};

export default createAdminDashboardRoutes;
