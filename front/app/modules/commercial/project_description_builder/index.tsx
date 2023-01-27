import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const ProjectDescriptionBuilderComponent = React.lazy(
  () => import('./admin/containers')
);
const FullscreenPreview = React.lazy(
  () =>
    import(
      'modules/commercial/project_description_builder/admin/containers/FullscreenPreview'
    )
);

const ContentViewer = React.lazy(
  () =>
    import(
      'modules/commercial/project_description_builder/admin/components/ContentViewer'
    )
);

const ProjectDescriptionBuilderToggle = React.lazy(
  () =>
    import(
      'modules/commercial/project_description_builder/admin/components/ProjectDescriptionBuilderToggle'
    )
);

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'project-description-builder/projects/:projectId/description',
        element: <ProjectDescriptionBuilderComponent />,
      },
      {
        path: 'project-description-builder/projects/:projectId/preview',
        element: <FullscreenPreview />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.description.projectDescriptionBuilder':
      (props) => {
        return <ProjectDescriptionBuilderToggle {...props} />;
      },
    'app.ProjectsShowPage.shared.header.ProjectInfo.projectDescriptionBuilder':
      (props) => {
        return <ContentViewer {...props} />;
      },
  },
};

export default configuration;
