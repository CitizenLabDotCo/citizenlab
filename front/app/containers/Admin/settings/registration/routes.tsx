import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Outlet as RouterOutlet } from 'utils/router';

import { settingsRoute } from '../routes';

import createCustomFieldRoutes from './CustomFieldRoutes/routes';

const AdminSettingsRegistration = lazy(() => import('.'));

export const registrationRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'registration',
  component: () => <RouterOutlet />,
});

const registrationIndexRoute = createRoute({
  getParentRoute: () => registrationRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminSettingsRegistration />
    </PageLoading>
  ),
});

const createRegistrationRoutes = () => {
  return registrationRoute.addChildren([
    registrationIndexRoute,
    createCustomFieldRoutes(),
  ]);
};

export default createRegistrationRoutes;
