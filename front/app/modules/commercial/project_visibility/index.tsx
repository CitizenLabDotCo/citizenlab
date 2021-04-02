import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectVisibility from './admin/containers/index';
import Tab from './admin/components/Tab';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('project_visibility');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // could be the same as, but might diverge from RenderOnFeatureFlag
  const isEnabled = useFeatureFlag('project_visibility');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions.participationRights': (
      props
    ) => (
      <RenderOnFeatureFlag>
        <ProjectVisibility {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.edit': (props) => {
      return (
        <RenderOnTabHideCondition>
          <Tab {...props} />
        </RenderOnTabHideCondition>
      );
    },
  },
};

export default configuration;
