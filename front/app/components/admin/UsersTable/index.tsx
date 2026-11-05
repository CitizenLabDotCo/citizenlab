import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Tbody,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import HeaderCell from './HeaderCell';
import messages from './messages';
import Row from './Row';

interface Props {
  users: IUserData[];
}

const UsersTable = ({ users }: Props) => {
  return (
    <TableComponent
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{ bodyRows: true }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <HeaderCell message={messages.name} />
          <HeaderCell message={messages.role} />
          <HeaderCell message={messages.inviteStatus} />
          <HeaderCell message={messages.options} />
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

export default UsersTable;
