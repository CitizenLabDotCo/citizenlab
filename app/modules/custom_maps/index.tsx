import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    adminProjectMapTab: [
      {
        path: '/:locale/admin/projects/:projectId/map',
        name: 'admin projects map',
        container: () =>
          import(
            'modules/custom_maps/admin/containers/ProjectCustomMapConfigPage'
          ),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.tabs.map': (props) => (
      <Tab {...props} />
    ),
  },
};

export default configuration;
