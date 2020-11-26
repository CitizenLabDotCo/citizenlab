import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import LightningBolt from './components/LightningBolt';
import SmartGroupType from './components/SmartGroupType';


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
    'app.containers.Admin.users.GroupCreationStep1.type': ({
      onClick,
      formattedLink,
    }) => <SmartGroupType onClick={onClick} formattedLink={formattedLink} />,
    'app.containers.Admin.users.GroupsListPanel.listitem.icon': ({ type }) => (
      <RenderOnType type={type}>
        <LightningBolt />
      </RenderOnType>
    ),
  },
};

export default configuration;
