import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import React, { ReactNode } from 'react';
import { MembershipType } from 'api/groups/types';
import { ModuleConfiguration } from 'utils/moduleUtils';
const HeaderIcon = React.lazy(() => import('./components/HeaderIcon'));

const ListItemIcon = React.lazy(() => import('./components/ListItemIcon'));
const SmartGroupModalHeader = React.lazy(
  () => import('./components/SmartGroupModalHeader')
);
import SmartGroupType, {
  SmartGroupTypeProps,
} from './components/SmartGroupType';
const RulesGroupFormWithValidation = React.lazy(
  () => import('./containers/RulesGroupFormWithValidation')
);
import { RulesFormValues } from './containers/RulesGroupFormWithValidation/RulesGroupForm';

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
  onSubmit: (values: NormalFormValues) => Promise<void>;
  isVerificationEnabled: boolean;
  initialValues: RulesFormValues;
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
