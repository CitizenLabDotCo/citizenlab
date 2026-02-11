import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { parseModuleRoutes, type RouteConfiguration } from 'utils/moduleUtils';
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

const createAdminIdeasRoutes = (moduleRoutes: RouteConfiguration[] = []) => {
  return ideasRoute.addChildren([
    ideasIndexRoute,
    // Cast as never[] so dynamic module routes (which have `string` paths)
    // don't widen the route tree type and break TanStack Router's type inference.
    // The routes still work at runtime; they're just invisible to the type system.
    ...(parseModuleRoutes(moduleRoutes, ideasRoute) as never[]),
  ]);
};

export default createAdminIdeasRoutes;
