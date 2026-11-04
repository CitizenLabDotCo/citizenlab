import React, { lazy } from 'react';

import { createRoute, createRootRoute, Outlet } from '@tanstack/react-router';

import { createAdminRoutes } from 'containers/Admin/routes';

import PageLoading from 'components/Hero';

const HomePage = lazy(() => import('containers/HomePage'));

const rootRoute = createRootRoute({ component: Outlet });

export const localeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$locale',
  component: Outlet,
});

const homeRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

export const routeTree = rootRoute.addChildren([
  localeRoute.addChildren([homeRoute, createAdminRoutes({})]),
]);
