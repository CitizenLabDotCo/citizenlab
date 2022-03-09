import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: '/:locale/admin/projects/:projectId/content-builder',
        name: 'content-builder',
        container: () => import('./admin/containers/index'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.all.container.edit.description.contentBuilder':
      (props) => {
        return (
          <a href={'/admin/projects/' + props.projectId + '/content-builder'}>
            Advanced Editor
          </a>
        );
      },
  },
};

export default configuration;
