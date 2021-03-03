import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import InputAssignment from './admin/containers';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('idea_assignment');

  if (isEnabled) {
    return <>{children}</>;
  }

  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions.inputAssignment': (
      props
    ) => (
      <RenderOnFeatureFlag>
        <InputAssignment {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
