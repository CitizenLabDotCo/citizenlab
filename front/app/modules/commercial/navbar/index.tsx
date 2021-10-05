import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'navigation',
        container: () => import('./admin/containers/NavigationSettings'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
