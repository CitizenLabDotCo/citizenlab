import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const ContentBuilderComponent = React.lazy(() => import('./admin/containers'));
const ContentBuilderEditModePreview = React.lazy(
  () =>
    import(
      'modules/commercial/content_builder/admin/components/ContentBuilderEditModePreview/EditModePreview'
    )
);

const ContentBuilderPreview = React.lazy(
  () =>
    import(
      'modules/commercial/content_builder/admin/components/ContentBuilderPreview'
    )
);

const ContentBuilderToggle = React.lazy(
  () =>
    import(
      'modules/commercial/content_builder/admin/components/ContentBuilderToggle'
    )
);

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'content-builder/projects/:projectId/description',
        element: <ContentBuilderComponent />,
      },
      {
        path: 'content-builder/projects/:projectId/preview',
        element: <ContentBuilderEditModePreview />,
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
