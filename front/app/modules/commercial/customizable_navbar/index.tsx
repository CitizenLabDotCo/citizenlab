import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import ModuleActive from './admin/components/ModuleActive';

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
    'app.containers.Admin.settings.customize.Events': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.customize.AllInput': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.initiatives.settings.EnableSwitch': (props) => (
      <ModuleActive {...props} />
    ),
  },
};

export default configuration;
