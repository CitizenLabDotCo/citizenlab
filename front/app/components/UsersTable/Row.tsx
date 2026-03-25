import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import ActionsMenu from '../../containers/Admin/users/_shared/UserManager/UsersTable/UsersTableRow/ActionsMenu';
import NameAvatarEmail from '../../containers/Admin/users/_shared/UserManager/UsersTable/UsersTableRow/NameAvatarEmail';
import UserRole from '../../containers/Admin/users/_shared/UserManager/UsersTable/UsersTableRow/UserRole';

interface Props {
  user: IUserData;
}

const Row = ({ user }: Props) => {
  return (
    <Tr>
      <Td>
        <NameAvatarEmail user={user} />
      </Td>
      <Td>
        <UserRole user={user} />
      </Td>
      <Td>
        <InviteBadge user={user} />
      </Td>
      <Td>
        <ActionsMenu user={user} />
      </Td>
    </Tr>
  );
};

export default Row;
