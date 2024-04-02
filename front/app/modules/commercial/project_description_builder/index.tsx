import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

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

export enum descriptionBuilderRoutes {
  projectdescriptionBuilder = 'project-description-builder',
  description = `project-description-builder/projects/:projectId/description`,
  preview = `project-description-builder/projects/:projectId/preview`,
}

export type descriptionBuilderRouteTypes =
  | AdminRoute<`${descriptionBuilderRoutes.projectdescriptionBuilder}/projects/${string}/description`>
  | AdminRoute<`${descriptionBuilderRoutes.projectdescriptionBuilder}/projects/${string}/preview`>;

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: descriptionBuilderRoutes.description,
        element: <ProjectDescriptionBuilderComponent />,
      },
      {
        path: descriptionBuilderRoutes.preview,
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
