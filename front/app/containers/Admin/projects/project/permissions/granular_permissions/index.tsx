import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const InitiativeSettingsTab = React.lazy(
  () => import('./components/InitiativeSettingsTab')
);

const AdminGranularPermissionsComponent = React.lazy(
  () => import('./containers/permissions')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.initiatives': [
      {
        path: 'permissions',
        element: <AdminGranularPermissionsComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.initiatives.tabs': (props) => (
      <InitiativeSettingsTab {...props} />
    ),
  },
};

export default configuration;
