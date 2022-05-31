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
      <Loading admin>
        <DashboardWrapper />
      </Loading>
    ),
    children: [
      {
        index: true,
        element: (
          <Loading admin>
            <Summary />
          </Loading>
        ),
      },
      {
        path: 'users',
        element: (
          <Loading admin>
            <Users />
          </Loading>
        ),
      },
      ...moduleConfiguration.routes['admin.dashboards'],
    ],
  };
};

export default createAdminDashboardRoutes;
