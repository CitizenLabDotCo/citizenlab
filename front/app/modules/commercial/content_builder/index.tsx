import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/contentBuilderToggle';
import SideBar from 'modules/commercial/content_builder/admin/components/SideBar';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'content-builder/projects/:projectId/description',
        name: 'content_builder',
        container: () => import('./admin/containers/index'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.description.contentBuilder': () => {
      return <ContentBuilderToggle />;
    },
    'app.containers.Admin.contentBuilderSideBar': ({ onMount }) => {
      return <SideBar onMount={onMount} />;
    },
  },
};

export default configuration;
