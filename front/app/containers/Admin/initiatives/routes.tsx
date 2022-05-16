import React, { lazy } from 'react';
// import moduleConfiguration from 'modules';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));

const AdminInitiativesManage = lazy(() => import('./manage'));
import { LoadingComponent } from 'routes';
const createAdminInitiativesRoutes = () => ({
  path: 'initiatives',
  element: (
    <LoadingComponent>
      <AdminInitiativesIndex />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminInitiativesSettings />
        </LoadingComponent>
      ),
    },
    {
      path: 'manage',
      element: (
        <LoadingComponent>
          <AdminInitiativesManage />
        </LoadingComponent>
      ),
    },
    // ...moduleConfiguration.routes['admin.initiatives'],
  ],
});

export default createAdminInitiativesRoutes;
