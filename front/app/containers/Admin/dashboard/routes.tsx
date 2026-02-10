import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

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

export enum dashboardRoutes {
  dashboard = 'dashboard',
  overview = 'overview',
  users = 'users',
  visitors = 'visitors',
  management_feed = 'management-feed',
  moderation = 'moderation',
  representation = 'representation',
}

export enum moderationRoutes {
  moderation = 'moderation',
}

export enum representativenessRoutes {
  representation = 'representation',
  editBaseData = `representation/edit-base-data`,
}

export type dashboardRouteTypes =
  | AdminRoute<dashboardRoutes.dashboard>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.overview}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.users}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.visitors}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.management_feed}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.moderation}`>
  | AdminRoute<`${dashboardRoutes.dashboard}/${dashboardRoutes.representation}`>
  | AdminRoute<`dashboard/${representativenessRoutes.representation}`>
  | AdminRoute<`dashboard/${representativenessRoutes.editBaseData}`>
  | AdminRoute<`dashboard/${moderationRoutes.moderation}`>;

// Dashboard layout route
const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: dashboardRoutes.dashboard,
  component: () => (
    <PageLoading>
      <DashboardWrapper />
    </PageLoading>
  ),
});

const overviewRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: dashboardRoutes.overview,
  component: () => (
    <PageLoading>
      <Overview />
    </PageLoading>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: dashboardRoutes.users,
  component: () => (
    <PageLoading>
      <Users />
    </PageLoading>
  ),
});

const visitorsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: dashboardRoutes.visitors,
  component: () => (
    <PageLoading>
      <Visitors />
    </PageLoading>
  ),
});

const managementFeedRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: dashboardRoutes.management_feed,
  component: () => (
    <PageLoading>
      <ManagementFeed />
    </PageLoading>
  ),
});

const representationRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: representativenessRoutes.representation,
  component: () => <DashboardContainer />,
});

const editBaseDataRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: representativenessRoutes.editBaseData,
  component: () => <ReferenceDataInterface />,
});

const moderationRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: moderationRoutes.moderation,
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
