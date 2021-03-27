import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import LeafletConfig from './shared/components/Map/LeafletConfig';
import Legend from './shared/components/Map/Legend';

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
    'app.components.Map.leafletConfig': (props) => <LeafletConfig {...props} />,
    'app.components.Map.Legend': (props) => <Legend {...props} />,
    'app.containers.Admin.projects.edit': (props) => <Tab {...props} />,
  },
};

export default configuration;
