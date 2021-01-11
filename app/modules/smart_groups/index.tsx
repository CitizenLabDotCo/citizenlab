import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import React, { ReactNode } from 'react';
import { MembershipType } from 'resources/GetGroups';
import { IGroupDataAttributes } from 'services/groups';
import { FormikSubmitHandler } from 'typings';
import { ModuleConfiguration } from 'utils/moduleUtils';
import HeaderIcon from './components/HeaderIcon';

import ListItemIcon from './components/ListItemIcon';
import SmartGroupModalHeader from './components/SmartGroupModalHeader';
import SmartGroupType, {
  SmartGroupTypeProps,
} from './components/SmartGroupType';
import RulesGroupFormWithValidation from './containers/RulesGroupFormWithValidation';

interface RenderOnTypeProps {
  type: MembershipType;
  children: ReactNode;
}

const RenderOnType = ({ type, children }: RenderOnTypeProps) => {
  if (type === 'rules') {
    return <>{children}</>;
  }
  return null;
};

interface ModalHeaderOutletProps {
  type: MembershipType;
}

const ModalHeaderOutlet = ({ type }: ModalHeaderOutletProps) => (
  <RenderOnType type={type}>
    <SmartGroupModalHeader />
  </RenderOnType>
);

interface ModalFormOutletProps {
  type: MembershipType;
  onSubmit: FormikSubmitHandler<NormalFormValues>;
  isVerificationEnabled: boolean;
  initialValues: IGroupDataAttributes;
}

const ModalFormOutlet = ({
  type,
  onSubmit,
  isVerificationEnabled,
  initialValues,
}: ModalFormOutletProps) => (
  <RenderOnType type={type}>
    <RulesGroupFormWithValidation
      initialValues={initialValues}
      onSubmit={onSubmit}
      isVerificationEnabled={isVerificationEnabled}
    />
  </RenderOnType>
);

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.users.GroupCreationStep1.type': ({
      onClick,
      formattedLink,
    }: SmartGroupTypeProps) => (
      <SmartGroupType onClick={onClick} formattedLink={formattedLink} />
    ),
    'app.containers.Admin.users.GroupsListPanel.listitem.icon': ({
      type,
    }: RenderOnTypeProps) => (
      <RenderOnType type={type}>
        <ListItemIcon />
      </RenderOnType>
    ),
    'app.containers.Admin.users.UsersHeader.icon': ({
      type,
    }: RenderOnTypeProps) => (
      <RenderOnType type={type}>
        <HeaderIcon />
      </RenderOnType>
    ),
    'app.containers.Admin.users.form': ModalFormOutlet,
    'app.containers.Admin.users.UsersGroup.form': ModalFormOutlet,
    'app.containers.Admin.users.UsersGroup.header': ModalHeaderOutlet,
    'app.containers.Admin.users.header': ModalHeaderOutlet,
  },
};

export default configuration;
