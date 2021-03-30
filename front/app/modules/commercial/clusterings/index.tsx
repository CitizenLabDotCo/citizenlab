import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'insights',
        container: () => import('./admin/containers/All'),
      },
      {
        path: 'insights/new',
        container: () => import('./admin/containers/New'),
      },
      {
        path: 'insights/:clusteringId',
        container: () => import('./admin/containers/Show'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboards.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
