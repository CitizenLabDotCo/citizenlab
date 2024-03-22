import React, { lazy } from 'react';

import InitiativePreviewIndex from 'components/admin/PostManager/components/InitiativePreviewIndex';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));
const AdminGranularPermissionsComponent = lazy(
  () =>
    import(
      'containers/Admin/projects/project/permissions/granular_permissions/containers/permissions'
    )
);

export enum initiativeRoutes {
  initiatives = 'initiatives',
  initiativesDefault = '',
  initiativeId = `:initiativeId`,
  settings = `settings`,
  permissions = `permissions`,
}

export type initiativeRouteTypes =
  | AdminRoute<initiativeRoutes.initiatives>
  | AdminRoute<`${initiativeRoutes.initiatives}/${string}`>
  | AdminRoute<`${initiativeRoutes.initiatives}/${initiativeRoutes.settings}`>
  | AdminRoute<`${initiativeRoutes.initiatives}/${initiativeRoutes.permissions}`>;

type RoutesTypes = {
  path: initiativeRoutes;
  element: JSX.Element;
  children: {
    path: initiativeRoutes;
    element: JSX.Element;
  }[];
};

const AdminInitiativesManage = lazy(() => import('./manage'));
const createAdminInitiativesRoutes = (): RoutesTypes => ({
  path: initiativeRoutes.initiatives,
  element: (
    <PageLoading>
      <AdminInitiativesIndex />
    </PageLoading>
  ),
  children: [
    {
      path: initiativeRoutes.initiativesDefault,
      element: (
        <PageLoading>
          <AdminInitiativesManage />
        </PageLoading>
      ),
    },
    {
      path: initiativeRoutes.initiativeId,
      element: (
        <PageLoading>
          <InitiativePreviewIndex />
        </PageLoading>
      ),
    },
    {
      path: initiativeRoutes.settings,
      element: (
        <PageLoading>
          <AdminInitiativesSettings />
        </PageLoading>
      ),
    },
    {
      path: initiativeRoutes.permissions,
      element: (
        <PageLoading>
          <AdminGranularPermissionsComponent />
        </PageLoading>
      ),
    },
  ],
});

export default createAdminInitiativesRoutes;
