import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
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
      element: (
        <PageLoading>
          <AdminInitiativesManage />
        </PageLoading>
      ),
    },
    {
      path: 'settings',
      element: (
        <PageLoading>
          <AdminInitiativesSettings />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.initiatives'],
  ],
});

export default createAdminInitiativesRoutes;
