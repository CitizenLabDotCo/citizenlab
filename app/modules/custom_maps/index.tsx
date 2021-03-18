import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects': [
      {
        path: '/:locale/admin/projects/:projectId/map',
        name: 'map',
        container: () =>
          import('./admin/containers/ProjectCustomMapConfigPage'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit': (props) => <Tab {...props} />,
  },
};

export default configuration;
