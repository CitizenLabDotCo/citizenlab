import React from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminWidgetsContainerComponent = React.lazy(
  () => import('./admin/containers')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.tools': [
      {
        path: 'widgets',
        element: <AdminWidgetsContainerComponent />,
      },
    ],
  },
};

export default configuration;
