import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import ActionsMenu from './ActionsMenu';
import NameAvatarEmail from './NameAvatarEmail';
import UserRole from './UserRole';

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
