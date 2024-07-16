import React, { lazy } from 'react';

import { Outlet } from 'react-router-dom';

import { AdminRoute } from 'containers/Admin/routes';

import PageLoading from 'components/UI/PageLoading';

import customFieldRoutes, {
  customFieldRouteTypes,
} from './CustomFieldRoutes/routes';

const AdminSettingsRegistration = lazy(() => import('.'));

enum registrationRoutes {
  registration = 'registration',
}

export type registrationRouteTypes =
  | AdminRoute<`settings/${registrationRoutes.registration}`>
  | customFieldRouteTypes;

export default () => ({
  path: 'registration',
  element: <Outlet />,
  children: [
    {
      path: '',
      element: (
        <PageLoading>
          <AdminSettingsRegistration />
        </PageLoading>
      ),
    },
    customFieldRoutes(),
  ],
});
