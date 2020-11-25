import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import useFeatureFlag from 'hooks/useFeatureFlag';

const RenderOnFeatureFlag = ({ children }) => {
  const isSmartGroupsEnabled = useFeatureFlag('smart_groups');
  if (isSmartGroupsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {},
  routes: {
    citizen: [],
    admin: [],
  },
};

export default configuration;
