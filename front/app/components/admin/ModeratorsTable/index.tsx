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

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import HeaderCell from 'components/admin/UsersTable/HeaderCell';
import userTableMessages from 'components/admin/UsersTable/messages';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import Row from './Row';

interface Props {
  moderators: IUserData[];
  onDeleteModerator?: (userId: string) => Promise<void>;
}

const ModeratorsTable = ({ moderators, onDeleteModerator }: Props) => {
  const { data: authUser } = useAuthUser();
  const authUserIsAdmin = isAdmin(authUser);

  if (moderators.length === 0) {
    return (
      <Text>
        <FormattedMessage {...messages.noManagers} />
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
          {authUserIsAdmin && <HeaderCell message={userTableMessages.role} />}
          <HeaderCell message={userTableMessages.inviteStatus} />
          <HeaderCell message={userTableMessages.options} />
        </Tr>
      </Thead>
      <Tbody>
        {moderators.map((moderator) => (
          <Row
            key={moderator.id}
            moderator={moderator}
            authUserIsAdmin={authUserIsAdmin}
            onDeleteModerator={onDeleteModerator}
          />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default ModeratorsTable;
