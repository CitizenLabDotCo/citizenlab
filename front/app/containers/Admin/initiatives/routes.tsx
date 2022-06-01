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
    <Loading admin>
      <AdminInitiativesIndex />
    </Loading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="settings" />,
    },
    {
      path: 'settings',
      element: (
        <Loading admin>
          <AdminInitiativesSettings />
        </Loading>
      ),
    },
    {
      path: 'manage',
      element: (
        <Loading admin>
          <AdminInitiativesManage />
        </Loading>
      ),
    },
    ...moduleConfiguration.routes['admin.initiatives'],
  ],
});

export default createAdminInitiativesRoutes;
