import React from 'react';

import { Tr, Td } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

interface Props {
  user: IUserData;
}

const Row = ({ user }: Props) => {
  return (
    <Tr>
      <Td>{user.id}</Td>
      <Td>Value 2</Td>
    </Tr>
  );
};

export default Row;
