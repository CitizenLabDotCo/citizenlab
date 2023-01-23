import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));

const AdminWidgetsContainerComponent = React.lazy(
  () => import('./admin/containers')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'widgets',
        element: <AdminWidgetsContainerComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
