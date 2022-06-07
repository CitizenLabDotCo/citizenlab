import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/ContentBuilderToggle';
import ContentBuilderPreview from 'modules/commercial/content_builder/admin/components/ContentBuilderPreview';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'content-builder/projects/:projectId/description',
        name: 'content_builder',
        container: () => import('./admin/containers'),
      },
      {
        path: 'content-builder/projects/:projectId/mobile-preview',
        name: 'content_builder_mobile_preview',
        container: () =>
          import(
            './admin/components/ContentBuilderMobileView/MobileViewPreview'
          ),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.description.contentBuilder': (
      props
    ) => {
      return <ContentBuilderToggle {...props} />;
    },
    'app.ProjectsShowPage.shared.header.ProjectInfo.contentBuilder': (
      props
    ) => {
      return <ContentBuilderPreview {...props} />;
    },
  },
};

export default configuration;
