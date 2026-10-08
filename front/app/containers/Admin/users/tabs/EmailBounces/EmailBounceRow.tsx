import React, { useState } from 'react';

import { Tr, Td, Button } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IUserData } from 'api/users/types';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

import ClearEmailBounceModal from './ClearEmailBounceModal';

interface Props {
  user: IUserData;
}

const EmailBounceRow = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpened, setModalOpened] = useState(false);
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
        <Button
          buttonStyle="secondary-outlined"
          size="s"
          onClick={() => setModalOpened(true)}
        >
          {formatMessage(messages.clearEmailBounce)}
        </Button>
        {modalOpened && (
          <ClearEmailBounceModal
            user={user}
            email={email}
            bouncedAt={email_bounced_at}
            setClose={() => setModalOpened(false)}
          />
        )}
      </Td>
    </Tr>
  );
};

export default EmailBounceRow;
