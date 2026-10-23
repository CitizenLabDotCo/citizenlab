import React, { lazy } from 'react';

import { localeRoute } from 'routes';

import { createRoute } from 'utils/router';

import createAdminProjectsRoutes from './projects/routes';
import createAdminToolsRoutes from './tools/routes';

const AdminContainer = lazy(() => import('containers/Admin'));

const AdminLayoutElement = () => <AdminContainer />;

export const adminRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'admin',
  component: AdminLayoutElement,
});

export const createAdminRoutes = (moduleRoutes: any) =>
  adminRoute.addChildren([
    createAdminProjectsRoutes(),
    createAdminToolsRoutes(moduleRoutes['admin.tools']),
  ]);
