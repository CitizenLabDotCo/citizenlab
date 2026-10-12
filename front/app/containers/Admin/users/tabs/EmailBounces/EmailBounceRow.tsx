import React from 'react';

import { Box, Tr, Td } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IUserData } from 'api/users/types';

import NameAvatarEmail from 'components/admin/UsersTable/NameAvatarEmail';

import DeleteUserButton from './DeleteUserButton';
import EmailBounceStatus from './EmailBounceStatus';

interface Props {
  user: IUserData;
}

const EmailBounceRow = ({ user }: Props) => {
  const { email, email_bounced_at, email_bounce_reason } = user.attributes;

  if (!email || !email_bounced_at) return null;

  return (
    <Tr>
      <Td>
        <NameAvatarEmail user={user} />
      </Td>
      <Td>
        <EmailBounceStatus user={user} />
      </Td>
      <Td>
        <FormattedDate value={email_bounced_at} />
      </Td>
      <Td>{email_bounce_reason}</Td>
      <Td>
        <Box display="flex" justifyContent="center">
          <DeleteUserButton user={user} />
        </Box>
      </Td>
    </Tr>
  );
};

export default EmailBounceRow;
