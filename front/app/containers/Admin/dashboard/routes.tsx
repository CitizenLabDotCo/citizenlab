import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
const DashboardWrapper = lazy(() => import('.'));
const Summary = lazy(() => import('./summary'));
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
            <Summary />
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
