import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));

export enum ideaRoutes {
  ideas = 'ideas',
  ideaId = `$ideaId`,
}

export type ideaRouteTypes =
  | AdminRoute<ideaRoutes.ideas>
  | AdminRoute<`${ideaRoutes.ideas}/${string}`>;

const ideasRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: ideaRoutes.ideas,
  component: () => (
    <PageLoading>
      <AdminIdeasContainer />
    </PageLoading>
  ),
});

const ideasIndexRoute = createRoute({
  getParentRoute: () => ideasRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminIdeasAll />
    </PageLoading>
  ),
});

const createAdminIdeasRoutes = () => {
  return ideasRoute.addChildren([
    ideasIndexRoute,
    // TODO: Wire in module routes (admin.ideas) after conversion
    // ...moduleConfiguration.routes['admin.ideas'],
  ]);
};

export default createAdminIdeasRoutes;
