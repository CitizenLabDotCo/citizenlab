import React from 'react';

// components
const Tab = React.lazy(() => import('./admin/components/Tab'));

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
  outlets: {
    'app.containers.Admin.dashboards.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
