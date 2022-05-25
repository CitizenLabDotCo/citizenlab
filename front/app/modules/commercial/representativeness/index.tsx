import React from 'react';

// components
import Tab from './admin/components/Tab';

// typings
import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'representativeness',
        container: () => import('./admin/containers'),
        indexRoute: {
          container: () => import('./admin/containers/Dashboard'),
        },
        childRoutes: [
          {
            path: 'manage-data',
            container: () =>
              import('./admin/containers/ReferenceDataInterface'),
          },
        ],
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboards.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
