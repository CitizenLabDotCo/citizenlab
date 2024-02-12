import React from 'react';

// typings
import { ModuleConfiguration } from 'utils/moduleUtils';

const DashboardContainer = React.lazy(
  () => import('./admin/containers/Dashboard')
);

const ReferenceDataInterface = React.lazy(
  () => import('./admin/containers/ReferenceDataInterface')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'representation',
        element: <DashboardContainer />,
      },
      {
        path: 'representation/edit-base-data',
        element: <ReferenceDataInterface />,
      },
    ],
  },
};

export default configuration;
