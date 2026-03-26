import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Tbody,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import HeaderCell from 'components/admin/UsersTable/HeaderCell';
import userTableMessages from 'components/admin/UsersTable/messages';

import Row from './Row';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  moderators: IUserData[];
  onDeleteModerator: (userId: string) => Promise<void>;
}

const ModeratorsTable = ({ moderators, onDeleteModerator }: Props) => {
  if (moderators.length === 0) {
    return (
      <Text>
        <FormattedMessage {...messages.noModerators} />
      </Text>
    );
  }

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
          <HeaderCell message={userTableMessages.options} />
        </Tr>
      </Thead>
      <Tbody>
        {moderators.map((moderator) => (
          <Row
            key={moderator.id}
            moderator={moderator}
            onDeleteModerator={onDeleteModerator}
          />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default ModeratorsTable;
