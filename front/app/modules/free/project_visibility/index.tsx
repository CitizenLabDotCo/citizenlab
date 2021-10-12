import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectVisibility from './admin/containers/index';
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
  const isEnabled = useFeatureFlag({ name: 'project_visibility' });
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
      <FeatureFlag name="project_visibility">
        <ProjectVisibility {...props} />
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
