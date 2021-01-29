import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Granular from './admin/containers/Granular';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isGranularPermissionsEnabled = useFeatureFlag('granular_permissions');
  if (isGranularPermissionsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions': (props) => (
      <RenderOnFeatureFlag>
        <Granular {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
