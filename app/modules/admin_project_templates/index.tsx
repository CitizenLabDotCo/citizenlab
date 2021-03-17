import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectTemplates from './admin/containers';
import Tab from './admin/components/Tab';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { TTabValue } from 'containers/Admin/projects/all/CreateProject';

declare module 'containers/Admin/projects/all/CreateProject' {
  type TProjectTemplatesTabValue = 'template';
}

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnSelectedTabValueProps = {
  selectedTabValue: TTabValue;
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
  outlets: {
    'app.containers.Admin.projects.all.createProject': (props) => (
      <RenderOnFeatureFlag>
        <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
          <ProjectTemplates />
        </RenderOnSelectedTabValue>
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => (
      <RenderOnFeatureFlag>
        <Tab {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
