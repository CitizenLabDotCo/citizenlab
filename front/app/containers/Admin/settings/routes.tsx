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
    <Loading>
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
        <Loading>
          <AdminSettingsGeneral />
        </Loading>
      ),
    },
    {
      path: 'customize',
      element: (
        <Loading>
          <AdminSettingsCustomize />
        </Loading>
      ),
    },
    {
      path: 'pages',
      element: (
        <Loading>
          <AdminSettingsPages />
        </Loading>
      ),
    },
    {
      path: 'policies',
      element: (
        <Loading>
          <AdminSettingsPolicies />
        </Loading>
      ),
    },
    {
      path: 'registration',
      element: (
        <Loading>
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
            <Loading>
              <AdminAreasAll />
            </Loading>
          ),
        },
        {
          path: 'new',
          element: (
            <Loading>
              <AdminAreasNew />
            </Loading>
          ),
        },
        {
          path: ':areaId',
          element: (
            <Loading>
              <AdminAreasEdit />
            </Loading>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
