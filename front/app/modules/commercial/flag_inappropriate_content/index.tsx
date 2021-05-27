import { ModuleConfiguration } from 'utils/moduleUtils';
import React, { ReactNode } from 'react';
import Setting from './admin/containers/Setting';
import RemoveFlagButton from './admin/components/RemoveFlagButton';
import useFeatureFlag from 'hooks/useFeatureFlag';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('flag_inappropriate_content');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.general.form': (props) => (
      <RenderOnFeatureFlag>
        <Setting {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.module.moderation.admin.containers.actionbar.buttons': (props) => {
      return <RemoveFlagButton {...props} />;
    },
  },
};

export default configuration;
