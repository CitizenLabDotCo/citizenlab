import React from 'react';

import { Tr, Td, colors, Checkbox } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';

import useLocale from 'hooks/useLocale';

import { FormattedMessage } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';

import messages from '../../../../messages';

import ActionsMenu from './ActionsMenu';
import NameAvatarEmail from './NameAvatarEmail';
import UserRole from './UserRole';

const RegisteredAt = styled(Td)`
  white-space: nowrap;
`;

interface Props {
  userInRow: IUserData;
  selected: boolean;
  toggleSelect: () => void;
}

const UsersTableRow = ({ userInRow, selected, toggleSelect }: Props) => {
  const locale = useLocale();

  const userInRowHasRegistered =
    userInRow.attributes.invite_status !== 'pending';

  return (
    <>
      <Tr
        key={userInRow.id}
        background={selected ? colors.background : undefined}
        className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
      >
        <Td>
          <Checkbox checked={selected} onChange={toggleSelect} />
        </Td>
        <Td>
          <NameAvatarEmail user={userInRow} />
        </Td>
        <Td>
          <UserRole user={userInRow} />
        </Td>
        <Td>
          {userInRow.attributes.last_active_at &&
            timeAgo(Date.parse(userInRow.attributes.last_active_at), locale)}
        </Td>
        <RegisteredAt>
          {/*
          For the 'all registered users' group, we do not show invited Users who have not yet accepted their invites,
          but we do in groups they have been added to when invited.

          The 'Invitation pending' messages should clarify this.

          https://citizenlab.atlassian.net/browse/CL-2255
        */}

          {userInRowHasRegistered ? (
            moment(userInRow.attributes.registration_completed_at).format('LL')
          ) : (
            <i>
              <FormattedMessage {...messages.userInvitationPending} />
            </i>
          )}
        </RegisteredAt>

        <Td>
          <ActionsMenu user={userInRow} />
        </Td>
      </Tr>
    </>
  );
};

export default UsersTableRow;
