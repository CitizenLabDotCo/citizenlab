import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/ContentBuilderToggle';
import ContentBuilderPreview from 'modules/commercial/content_builder/admin/components/ContentBuilderPreview';
import EditModePreview from 'modules/commercial/content_builder/admin/components/ContentBuilderEditModePreview/EditModePreview';

const ContentBuilderComponent = React.lazy(() => import('./admin/containers'));

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'content-builder/projects/:projectId/description',
        element: <ContentBuilderComponent />,
      },
      {
        path: 'content-builder/projects/:projectId/preview',
        element: <EditModePreview />,
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
