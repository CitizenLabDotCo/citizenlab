import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/contentBuilderToggle';
import ContentBuilderLayout from 'modules/commercial/content_builder/admin/components/ContentBuilderLayout';

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
    'app.containers.Admin.contentBuilderLayout': ({
      onMount,
      childrenToRender,
    }) => {
      return (
        <>
          <ContentBuilderLayout onMount={onMount}>
            {childrenToRender}
          </ContentBuilderLayout>
        </>
      );
    },
  },
};

export default configuration;
