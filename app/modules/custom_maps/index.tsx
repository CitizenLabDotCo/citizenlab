import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import LeafletConfig from './shared/components/Map/LeafletConfig';
import Legend from './shared/components/Map/Legend';

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
    'app.components.Map.leafletConfig': (props) => <LeafletConfig {...props} />,
    'app.components.Map.Legend': (props) => <Legend {...props} />,
  },
};

export default configuration;
