import React, { lazy, Suspense } from 'react';
// import moduleConfiguration from 'modules';
const DashboardWrapper = lazy(() => import('.'));
const Summary = lazy(() => import('./summary'));
const Users = lazy(() => import('./users'));

const LoadingComponent = ({ children }) => {
  return <Suspense fallback={<div>LOADING!</div>}>{children}</Suspense>;
};

const createAdminDashboardRoutes = () => {
  return [
    {
      path: 'dashboard',
      element: (
        <LoadingComponent>
          <DashboardWrapper />
        </LoadingComponent>
      ),
      children: [
        {
          path: '/',
          index: true,
          element: (
            <LoadingComponent>
              <Summary />
            </LoadingComponent>
          ),
        },
        {
          path: '/users',
          element: (
            <LoadingComponent>
              <Users />
            </LoadingComponent>
          ),
        },
        // ...moduleConfiguration.routes['admin.dashboards'],
      ],
    },
  ];
};

export default createAdminDashboardRoutes;
