import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import useFeatureFlag from 'hooks/useFeatureFlag';
import LightningBolt from './components/LightningBolt';
import SmartGroupType from './components/SmartGroupType';
import RulesGroupFormWithValidation from './containers/RulesGroupFormWithValidation';

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
    'app.containers.Admin.users.form': ({
      type,
      onSubmit,
      isVerificationEnabled,
    }) => (
      <RenderOnType type={type}>
        <RulesGroupFormWithValidation
          onSubmit={onSubmit}
          isVerificationEnabled={isVerificationEnabled}
        />
      </RenderOnType>
    ),
    'app.containers.Admin.users.UsersGroup.form': ({
      type,
      onSubmit,
      isVerificationEnabled,
    }) => (
      <RenderOnType type={type}>
        <RulesGroupFormWithValidation
          onSubmit={onSubmit}
          isVerificationEnabled={isVerificationEnabled}
        />
      </RenderOnType>
    ),
  },
};

export default configuration;
