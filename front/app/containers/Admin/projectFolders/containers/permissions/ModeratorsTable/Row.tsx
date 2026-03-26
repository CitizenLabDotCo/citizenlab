import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import NameAvatarEmail from 'components/admin/UsersTable/NameAvatarEmail';
import UserRole from 'components/admin/UsersTable/UserRole';

interface Props {
  moderator: IUserData;
}

const Row = ({ moderator }: Props) => {
  return (
    <Tr>
      <Td>
        <NameAvatarEmail user={moderator} />
      </Td>
      <Td>
        <UserRole user={moderator} />
      </Td>
      <Td>
        <InviteBadge user={moderator} />
      </Td>
      <Td>TODO button</Td>
    </Tr>
  );
};

export default Row;
