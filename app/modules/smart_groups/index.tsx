import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import LightningBolt from './components/LightningBolt';

const RenderOnFeatureFlag = ({ children }) => {
  const isSmartGroupsEnabled = useFeatureFlag('smart_groups');
  if (isSmartGroupsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const RenderOnType = ({ type, children }) => {
  if (type === 'rules') {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.users.GroupsListPanel.listitem.icon': ({ type }) => (
      <RenderOnType type={type}>
        <LightningBolt />
      </RenderOnType>
    ),
  },
  routes: {
    citizen: [],
    admin: [],
  },
};

export default configuration;
