import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CreateProjectFromTemplate from './admin/containers/CreateProjectFromTemplate';
import Tab from './admin/components/Tab';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import ProjectTemplatePreviewAdminWithEventWrapper from './admin/containers/ProjectTemplatePreviewAdminWithEventWrapper';
declare module 'containers/Admin/projects/all/CreateProject' {
  export interface ITabNamesMap {
    template: 'template';
  }
}

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnSelectedTabValueProps = {
  selectedTabValue: TTabName;
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('admin_project_templates');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
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
        <RenderOnFeatureFlag>
          <ProjectTemplatePreviewAdminWithEventWrapper
            onRender={props.onRender}
          />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.Admin.projects.all.createProject': (props) => (
      <RenderOnFeatureFlag>
        <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
          <CreateProjectFromTemplate />
        </RenderOnSelectedTabValue>
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => {
      return (
        <RenderOnFeatureFlag>
          <Tab {...props} />
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;
