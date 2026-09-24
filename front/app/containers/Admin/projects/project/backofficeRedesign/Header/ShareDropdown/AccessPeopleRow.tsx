import React from 'react';

import { Box, NewBOText } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import Avatar from 'components/Avatar';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

const getRoleMessage = (user: IUserData, isInvitePending: boolean) => {
  if (isInvitePending) return messages.shareRolePending;

  return isAdmin({ data: user })
    ? messages.shareRoleOwner
    : messages.shareRoleManager;
};

interface Props {
  user: IUserData;
  isAuthUser: boolean;
}

const AccessPeopleRow = ({ user, isAuthUser }: Props) => {
  const { formatMessage } = useIntl();
  const { first_name, last_name, email, invite_status } = user.attributes;
  const isInvitePending = invite_status === 'pending';
  const name = [first_name, last_name].filter(Boolean).join(' ');

  const roleMessage = getRoleMessage(user, isInvitePending);

  return (
    <Box display="flex" alignItems="center" gap="12px" py="8px">
      <Avatar userId={user.id} size={36} />
      <Box flex="1 1 auto" minWidth="0">
        <NewBOText variant="label">
          {isInvitePending ? email : name}
          {isAuthUser && (
            <NewBOText variant="helper" as="span" ml="4px">
              {formatMessage(messages.shareYou)}
            </NewBOText>
          )}
        </NewBOText>
      </Box>
      <NewBOText variant="helper">{formatMessage(roleMessage)}</NewBOText>
    </Box>
  );
};

export default AccessPeopleRow;
