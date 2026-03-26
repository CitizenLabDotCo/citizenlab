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

import HeaderCell from 'components/admin/UsersTable/HeaderCell';
import userTableMessages from 'components/admin/UsersTable/messages';

import messages from './messages';
import Row from './Row';

interface Props {
  moderators: IUserData[];
}

const ModeratorsTable = ({ moderators }: Props) => {
  return (
    <TableComponent
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{ bodyRows: true }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <HeaderCell message={userTableMessages.name} />
          <HeaderCell message={userTableMessages.role} />
          <HeaderCell message={userTableMessages.inviteStatus} />
          <HeaderCell message={messages.deleteModerator} />
        </Tr>
      </Thead>
      <Tbody>
        {moderators.map((moderator) => (
          <Row key={moderator.id} moderator={moderator} />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default ModeratorsTable;
