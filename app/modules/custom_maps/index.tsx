import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import Map from './shared/components/Map';

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
    'app.components.IdeasMap.map': (props) => <Map {...props} />,
    'app.components.DropdownMap.map': (props) => <Map {...props} />,
  },
};

export default configuration;
