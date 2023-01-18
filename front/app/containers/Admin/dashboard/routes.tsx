import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
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
    ],
  };
};

export default createAdminDashboardRoutes;
