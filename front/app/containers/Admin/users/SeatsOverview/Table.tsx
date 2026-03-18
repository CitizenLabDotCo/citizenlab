import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import Row from './Row';

interface Props {
  users: IUserData[];
}

const Table = ({ users }: Props) => {
  return (
    <TableComponent
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{ bodyRows: true }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <Th py="16px">Column</Th>
          <Th py="16px">Column</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((user) => (
          <Row key={user.id} user={user} />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default Table;
