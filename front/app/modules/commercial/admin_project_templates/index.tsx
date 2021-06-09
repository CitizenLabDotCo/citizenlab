import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CreateProjectFromTemplate from './admin/containers/CreateProjectFromTemplate';
import Tab from './admin/components/Tab';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import ProjectTemplatePreviewAdminWithEventWrapper from './admin/containers/ProjectTemplatePreviewAdminWithEventWrapper';
import { RenderOnFeatureFlag } from 'modules/utilComponents';

declare module 'containers/Admin/projects/all/CreateProject' {
  export interface ITabNamesMap {
    template: 'template';
  }
}

type RenderOnSelectedTabValueProps = {
  selectedTabValue: TTabName;
  children: ReactNode;
};

const RenderOnSelectedTabValue = ({
  selectedTabValue,
  children,
}: RenderOnSelectedTabValueProps) => {
  if (selectedTabValue !== 'template') return null;
  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    citizen: [
      {
        path: 'templates/:projectTemplateId',
        name: 'project template preview page',
        container: () =>
          import('./citizen/containers/ProjectTemplatePreviewCitizen'),
      },
    ],
    'admin.project_templates': [
      {
        path: 'templates/:projectTemplateId',
        name: 'admin project template preview page',
        container: () =>
          import('./admin/containers/ProjectTemplatePreviewAdmin'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.all.container': (props) => {
      return (
        <RenderOnFeatureFlag featureFlagName="admin_project_templates">
          <ProjectTemplatePreviewAdminWithEventWrapper
            onRender={props.onRender}
          />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.Admin.projects.all.createProject': (props) => (
      <RenderOnFeatureFlag featureFlagName="admin_project_templates">
        <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
          <CreateProjectFromTemplate />
        </RenderOnSelectedTabValue>
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => {
      return (
        <RenderOnFeatureFlag featureFlagName="admin_project_templates">
          <Tab {...props} />
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;
