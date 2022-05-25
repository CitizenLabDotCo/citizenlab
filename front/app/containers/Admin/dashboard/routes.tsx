import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
const DashboardWrapper = lazy(() => import('.'));
const Summary = lazy(() => import('./summary'));
const Users = lazy(() => import('./users'));

import { LoadingComponent } from 'routes';

const createAdminDashboardRoutes = () => {
  return {
    path: 'dashboard',
    element: (
      <LoadingComponent>
        <DashboardWrapper />
      </LoadingComponent>
    ),
    children: [
      {
        index: true,
        element: (
          <LoadingComponent>
            <Summary />
          </LoadingComponent>
        ),
      },
      {
        path: 'users',
        element: (
          <LoadingComponent>
            <Users />
          </LoadingComponent>
        ),
      },
      ...moduleConfiguration.routes['admin.dashboards'],
    ],
  };
};

export default createAdminDashboardRoutes;
