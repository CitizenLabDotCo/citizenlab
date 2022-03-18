import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/contentBuilderToggle';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'projects/:projectId/description/content-builder',
        name: 'content_builder',
        container: () => import('./admin/components/ContentBuilderTopBar'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.description.contentBuilder': () => {
      return (
        <>
          <ContentBuilderToggle />
        </>
      );
    },
  },
};

export default configuration;
