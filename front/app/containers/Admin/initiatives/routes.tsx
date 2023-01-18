import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import PageLoading from 'components/UI/PageLoading';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));

const AdminInitiativesManage = lazy(() => import('./manage'));
const createAdminInitiativesRoutes = () => ({
  path: 'initiatives',
  element: (
    <PageLoading>
      <AdminInitiativesIndex />
    </PageLoading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="settings" />,
    },
    {
      path: 'settings',
      element: (
        <PageLoading>
          <AdminInitiativesSettings />
        </PageLoading>
      ),
    },
    {
      path: 'manage',
      element: (
        <PageLoading>
          <AdminInitiativesManage />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminInitiativesRoutes;
