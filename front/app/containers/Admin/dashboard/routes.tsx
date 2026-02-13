import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

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

// Dashboard layout route
const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'dashboard',
  component: () => (
    <PageLoading>
      <DashboardWrapper />
    </PageLoading>
  ),
});

const overviewRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'overview',
  component: () => (
    <PageLoading>
      <Overview />
    </PageLoading>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'users',
  component: () => (
    <PageLoading>
      <Users />
    </PageLoading>
  ),
});

const visitorsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'visitors',
  component: () => (
    <PageLoading>
      <Visitors />
    </PageLoading>
  ),
});

const managementFeedRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'management-feed',
  component: () => (
    <PageLoading>
      <ManagementFeed />
    </PageLoading>
  ),
});

const representationRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'representation',
  component: () => <DashboardContainer />,
});

const editBaseDataRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'representation/edit-base-data',
  component: () => <ReferenceDataInterface />,
});

const moderationRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'moderation',
  component: () => <AdminModerationComponent />,
});

const createAdminDashboardRoutes = () => {
  return dashboardRoute.addChildren([
    overviewRoute,
    usersRoute,
    visitorsRoute,
    managementFeedRoute,
    representationRoute,
    editBaseDataRoute,
    moderationRoute,
  ]);
};

export default createAdminDashboardRoutes;
