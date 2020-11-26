import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import HeaderIcon from './components/HeaderIcon';

import ListItemIcon from './components/ListItemIcon';
import SmartGroupModalHeader from './components/SmartGroupModalHeader';
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
        <ListItemIcon />
      </RenderOnType>
    ),
    'app.containers.Admin.users.UsersHeader.icon': ({ type }) => (
      <RenderOnType type={type}>
        <HeaderIcon />
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
    'app.containers.Admin.users.header': ({ type }) => (
      <RenderOnType type={type}>
        <SmartGroupModalHeader />
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
    'app.containers.Admin.users.UsersGroup.header': ({ type }) => (
      <RenderOnType type={type}>
        <SmartGroupModalHeader />
      </RenderOnType>
    ),
  },
};

export default configuration;
