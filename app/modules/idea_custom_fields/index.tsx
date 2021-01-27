import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects': [
      {
        path: '/:locale/admin/projects/:projectId/ideaform',
        name: 'admin projects idea form',
        container: () => import('./admin/containers/projects/edit/ideaform'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit': (props) => <Tab {...props} />,
  },
};

export default configuration;
