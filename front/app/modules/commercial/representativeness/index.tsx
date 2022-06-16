import React from 'react';

// components
import Tab from './admin/components/Tab';

// typings
import { ModuleConfiguration } from 'utils/moduleUtils';

const DashboardContainer = React.lazy(
  () => import('./admin/containers/Dashboard')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'representativeness',
        element: <DashboardContainer />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboards.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
