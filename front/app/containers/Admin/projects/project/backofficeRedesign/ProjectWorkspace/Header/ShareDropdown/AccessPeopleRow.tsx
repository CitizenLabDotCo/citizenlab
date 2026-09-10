import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import Avatar from 'components/Avatar';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

interface Props {
  user: IUserData;
  isAuthUser: boolean;
}

const AccessPeopleRow = ({ user, isAuthUser }: Props) => {
  const { formatMessage } = useIntl();
  const { first_name, last_name, email, invite_status } = user.attributes;
  const isInvitePending = invite_status === 'pending';
  const name = [first_name, last_name].filter(Boolean).join(' ');

  const roleMessage = isInvitePending
    ? messages.shareRolePending
    : isAdmin({ data: user })
    ? messages.shareRoleOwner
    : messages.shareRoleManager;

  return (
    <Box display="flex" alignItems="center" gap="12px" py="8px">
      <Avatar userId={user.id} size={36} />
      <Box flex="1 1 auto" minWidth="0">
        <Text m="0" fontSize="s" color="textPrimary">
          {isInvitePending ? email : name}
          {isAuthUser && (
            <Text as="span" ml="4px" fontSize="s" color="textSecondary">
              {formatMessage(messages.shareYou)}
            </Text>
          )}
        </Text>
      </Box>
      <Text m="0" fontSize="s" color="textSecondary">
        {formatMessage(roleMessage)}
      </Text>
    </Box>
  );
};

export default AccessPeopleRow;
