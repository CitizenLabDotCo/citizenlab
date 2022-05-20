import React from 'react';
import { Navigate } from 'react-router-dom';
import moduleConfiguration from 'modules';
import { LoadingComponent } from 'routes';

const AdminSettingsIndexComponent = React.lazy(
  () => import('containers/Admin/settings')
);
const AdminSettingsGeneralComponent = React.lazy(
  () => import('containers/Admin/settings/general')
);
const AdminSettingsCustomizeComponent = React.lazy(
  () => import('containers/Admin/settings/customize')
);
const AdminSettingsPagesComponent = React.lazy(
  () => import('containers/Admin/settings/pages')
);
const AdminSettingsPoliciesComponent = React.lazy(
  () => import('containers/Admin/settings/policies')
);
const AdminSettingsRegistrationComponent = React.lazy(
  () => import('containers/Admin/settings/registration')
);
// areas
const AdminAreasAllComponent = React.lazy(() => import('./areas/all'));
const AdminAreasNewComponent = React.lazy(() => import('./areas/New'));
const AdminAreasEditComponent = React.lazy(() => import('./areas/Edit'));

export default () => ({
  path: 'settings',
  element: (
    <LoadingComponent>
      <AdminSettingsIndexComponent />
    </LoadingComponent>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="general" />,
    },
    {
      index: true,
      path: 'general',
      element: (
        <LoadingComponent>
          <AdminSettingsGeneralComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'customize',
      element: (
        <LoadingComponent>
          <AdminSettingsCustomizeComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'pages',
      element: (
        <LoadingComponent>
          <AdminSettingsPagesComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'policies',
      element: (
        <LoadingComponent>
          <AdminSettingsPoliciesComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'registration',
      element: (
        <LoadingComponent>
          <AdminSettingsRegistrationComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'areas',
      children: [
        {
          index: true,
          element: (
            <LoadingComponent>
              <AdminAreasAllComponent />
            </LoadingComponent>
          ),
        },
        {
          path: 'new',
          element: (
            <LoadingComponent>
              <AdminAreasNewComponent />
            </LoadingComponent>
          ),
        },
        {
          path: ':areaId',
          element: (
            <LoadingComponent>
              <AdminAreasEditComponent />
            </LoadingComponent>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
