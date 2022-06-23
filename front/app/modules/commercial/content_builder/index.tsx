import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/ContentBuilderToggle';
import ContentBuilderPreview from 'modules/commercial/content_builder/admin/components/ContentBuilderPreview';
import MobileViewPreview from 'modules/commercial/content_builder/admin/components/ContentBuilderMobileView/MobileViewPreview';

const ContentBuilderComponent = React.lazy(() => import('./admin/containers'));

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'content-builder/projects/:projectId/description',
        element: <ContentBuilderComponent />,
      },
      {
        path: 'content-builder/projects/:projectId/mobile-preview',
        element: <MobileViewPreview />,
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
