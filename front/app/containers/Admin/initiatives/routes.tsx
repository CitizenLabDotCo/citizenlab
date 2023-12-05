import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import InitiativePreviewIndex from 'components/admin/PostManager/components/InitiativePreviewIndex';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));
const AdminGranularPermissionsComponent = lazy(
  () =>
    import(
      'containers/Admin/projects/project/permissions/granular_permissions/containers/permissions'
    )
);

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
      path: ':initiativeId',
      element: (
        <PageLoading>
          <InitiativePreviewIndex />
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
    {
      path: 'permissions',
      element: (
        <PageLoading>
          <AdminGranularPermissionsComponent />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminInitiativesRoutes;
