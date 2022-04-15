import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'widgets',
        name: 'widgets',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
