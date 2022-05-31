import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import Loading from 'components/UI/Loading';
const DashboardWrapper = lazy(() => import('.'));
const Summary = lazy(() => import('./summary'));
const Users = lazy(() => import('./users'));

const createAdminDashboardRoutes = () => {
  return {
    path: 'dashboard',
    element: (
      <Loading>
        <DashboardWrapper />
      </Loading>
    ),
    children: [
      {
        index: true,
        element: (
          <Loading>
            <Summary />
          </Loading>
        ),
      },
      {
        path: 'users',
        element: (
          <Loading>
            <Users />
          </Loading>
        ),
      },
      ...moduleConfiguration.routes['admin.dashboards'],
    ],
  };
};

export default createAdminDashboardRoutes;
