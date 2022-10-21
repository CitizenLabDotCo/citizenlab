import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
import React, { lazy } from 'react';
const DashboardWrapper = lazy(() => import('.'));
const Overview = lazy(() => import('./overview'));
const Users = lazy(() => import('./users'));

const createAdminDashboardRoutes = () => {
  return {
    path: 'dashboard',
    element: (
      <PageLoading>
        <DashboardWrapper />
      </PageLoading>
    ),
    children: [
      {
        index: true,
        element: (
          <PageLoading>
            <Overview />
          </PageLoading>
        ),
      },
      {
        path: 'users',
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
