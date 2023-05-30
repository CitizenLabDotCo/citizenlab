import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import customFieldRoutes from './CustomFieldRoutes/routes';
import { Outlet } from 'react-router-dom';

const AdminSettingsRegistration = lazy(() => import('.'));

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
