import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import moduleConfiguration from 'modules';
import Loading from 'components/UI/Loading';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));

const AdminInitiativesManage = lazy(() => import('./manage'));
const createAdminInitiativesRoutes = () => ({
  path: 'initiatives',
  element: (
    <Loading>
      <AdminInitiativesIndex />
    </Loading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="settings" />,
    },
    {
      index: true,
      path: 'settings',
      element: (
        <Loading>
          <AdminInitiativesSettings />
        </Loading>
      ),
    },
    {
      path: 'manage',
      element: (
        <Loading>
          <AdminInitiativesManage />
        </Loading>
      ),
    },
    ...moduleConfiguration.routes['admin.initiatives'],
  ],
});

export default createAdminInitiativesRoutes;
