import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminModerationComponent = React.lazy(() => import('./admin/containers'));

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'moderation',
        element: <AdminModerationComponent />,
      },
    ],
  },
};

export default configuration;
