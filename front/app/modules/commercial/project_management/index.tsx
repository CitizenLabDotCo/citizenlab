import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectManagement from './admin/containers/ProjectManagement';
import Tab from './admin/components/Tab';
import FeatureFlag from 'components/FeatureFlag';

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // Could be more than just a feature flag check,
  // hence we're not using the FeatureFlag component
  const isEnabled = useFeatureFlag({ name: 'project_management' });
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions.moderatorRights': (
      props
    ) => (
      <FeatureFlag name="project_management">
        <ProjectManagement {...props} />
      </FeatureFlag>
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
