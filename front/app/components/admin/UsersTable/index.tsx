import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';
import Row from './Row';

const HeaderCel = ({ message }: { message: MessageDescriptor }) => (
  <Th py="16px">
    <Text m="0" fontSize="s" fontWeight="bold">
      <FormattedMessage {...message} />
    </Text>
  </Th>
);

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
          <HeaderCel message={messages.name} />
          <HeaderCel message={messages.role} />
          <HeaderCel message={messages.inviteStatus} />
          <HeaderCel message={messages.options} />
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
