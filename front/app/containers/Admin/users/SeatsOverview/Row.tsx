import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import NameAvatarEmail from '../_shared/UserManager/UsersTable/UsersTableRow/NameAvatarEmail';

interface Props {
  user: IUserData;
}

const Row = ({ user }: Props) => {
  return (
    <Tr>
      <Td>
        <NameAvatarEmail user={user} />
      </Td>
      <Td>Value 2</Td>
    </Tr>
  );
};

export default Row;
