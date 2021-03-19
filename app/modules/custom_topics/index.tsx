import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectEditTab from './admin/components/ProjectEditTab';
import SettingsTab from './admin/components/SettingsTab';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.projects': [
      {
        path: '/:locale/admin/projects/:projectId/topics',
        name: 'topics',
        container: () => import('./admin/containers/ProjectTopics'),
      },
    ],
    'admin.settings': [
      {
        path: '/:locale/admin/settings/topics',
        name: 'admin topics',
        indexRoute: {
          name: 'admin topics index',
          container: () => import('./admin/containers/TopicsSettings/all'),
        },
        childRoutes: [
          {
            path: '/:locale/admin/settings/topics/new',
            name: 'admin topics new',
            container: () => import('./admin/containers/TopicsSettings/New'),
          },
          {
            path: '/:locale/admin/settings/topics/:topicId/edit',
            name: 'admin topic edit',
            container: () => import('./admin/containers/TopicsSettings/Edit'),
          },
        ],
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit': (props) => (
      <ProjectEditTab {...props} />
    ),
    'app.containers.Admin.settings.tabs': (props) => <SettingsTab {...props} />,
  },
};

export default configuration;
