import React, { useState } from 'react';

import { Tr, Td, Button } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import UserDeleteModal from 'components/admin/UserDeleteModal';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

interface Props {
  user: IUserData;
}

const EmailBounceRow = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpened, setModalOpened] = useState(false);
  const { data: authUser } = useAuthUser();
  const { email, email_bounced_at, email_bounce_reason } = user.attributes;

  if (!email || !email_bounced_at) return null;

  return (
    <Tr>
      <Td>{getFullName(user)}</Td>
      <Td>{email}</Td>
      <Td>
        <FormattedDate value={email_bounced_at} />
      </Td>
      <Td>{email_bounce_reason}</Td>
      <Td>
        {/* Matches the users table: admins can't delete themselves */}
        {authUser?.data.id !== user.id && (
          <Button
            buttonStyle="delete"
            icon="delete"
            size="s"
            onClick={() => setModalOpened(true)}
          >
            {formatMessage(messages.emailBouncesDeleteUser)}
          </Button>
        )}
        {modalOpened && (
          <UserDeleteModal user={user} setClose={() => setModalOpened(false)} />
        )}
      </Td>
    </Tr>
  );
};

export default EmailBounceRow;
