import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import moduleConfiguration from 'modules';
import Loading from 'components/UI/Loading';

const AdminSettingsIndex = lazy(() => import('containers/Admin/settings'));
const AdminSettingsGeneral = lazy(
  () => import('containers/Admin/settings/general')
);
const AdminSettingsCustomize = lazy(
  () => import('containers/Admin/settings/customize')
);
const AdminSettingsPages = lazy(
  () => import('containers/Admin/settings/pages')
);
const AdminSettingsPolicies = lazy(
  () => import('containers/Admin/settings/policies')
);
const AdminSettingsRegistration = lazy(
  () => import('containers/Admin/settings/registration')
);
// areas
const AdminAreasAll = lazy(() => import('./areas/all'));
const AdminAreasNew = lazy(() => import('./areas/New'));
const AdminAreasEdit = lazy(() => import('./areas/Edit'));

export default () => ({
  path: 'settings',
  element: (
    <Loading admin>
      <AdminSettingsIndex />
    </Loading>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="general" />,
    },
    {
      path: 'general',
      element: (
        <Loading admin>
          <AdminSettingsGeneral />
        </Loading>
      ),
    },
    {
      path: 'customize',
      element: (
        <Loading admin>
          <AdminSettingsCustomize />
        </Loading>
      ),
    },
    {
      path: 'pages',
      element: (
        <Loading admin>
          <AdminSettingsPages />
        </Loading>
      ),
    },
    {
      path: 'policies',
      element: (
        <Loading admin>
          <AdminSettingsPolicies />
        </Loading>
      ),
    },
    {
      path: 'registration',
      element: (
        <Loading admin>
          <AdminSettingsRegistration />
        </Loading>
      ),
    },
    {
      path: 'areas',
      children: [
        {
          index: true,
          element: (
            <Loading admin>
              <AdminAreasAll />
            </Loading>
          ),
        },
        {
          path: 'new',
          element: (
            <Loading admin>
              <AdminAreasNew />
            </Loading>
          ),
        },
        {
          path: ':areaId',
          element: (
            <Loading admin>
              <AdminAreasEdit />
            </Loading>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
