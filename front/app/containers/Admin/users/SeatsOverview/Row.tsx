import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import ActionsMenu from '../_shared/UserManager/UsersTable/UsersTableRow/ActionsMenu';
import NameAvatarEmail from '../_shared/UserManager/UsersTable/UsersTableRow/NameAvatarEmail';
import UserRole from '../_shared/UserManager/UsersTable/UsersTableRow/UserRole';

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
      <Td>Value 2</Td>
      <Td>
        <ActionsMenu user={user} />
      </Td>
    </Tr>
  );
};

export default Row;
