import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import registrationRoutes from './registration/routes';

const AdminSettingsIndex = lazy(() => import('containers/Admin/settings'));
const AdminSettingsGeneral = lazy(
  () => import('containers/Admin/settings/general')
);
const AdminSettingsCustomize = lazy(
  () => import('containers/Admin/settings/customize')
);
const AdminSettingsPolicies = lazy(
  () => import('containers/Admin/settings/policies')
);
// areas
const AdminAreasAll = lazy(() => import('./areas/all'));
const AdminAreasNew = lazy(() => import('./areas/New'));
const AdminAreasEdit = lazy(() => import('./areas/Edit'));

export default () => ({
  path: 'settings',
  element: (
    <PageLoading>
      <AdminSettingsIndex />
    </PageLoading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="general" />,
    },
    {
      path: 'general',
      element: (
        <PageLoading>
          <AdminSettingsGeneral />
        </PageLoading>
      ),
    },
    {
      path: 'customize',
      element: (
        <PageLoading>
          <AdminSettingsCustomize />
        </PageLoading>
      ),
    },
    {
      path: 'policies',
      element: (
        <PageLoading>
          <AdminSettingsPolicies />
        </PageLoading>
      ),
    },
    registrationRoutes(),
    {
      path: 'areas',
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <AdminAreasAll />
            </PageLoading>
          ),
        },
        {
          path: 'new',
          element: (
            <PageLoading>
              <AdminAreasNew />
            </PageLoading>
          ),
        },
        {
          path: ':areaId',
          element: (
            <PageLoading>
              <AdminAreasEdit />
            </PageLoading>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
