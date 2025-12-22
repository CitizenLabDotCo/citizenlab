import React, { useState } from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import resendInvite from 'api/authentication/resendInvite';

import { State } from 'containers/Authentication/typings';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  state: State;
};

const InviteTaken = ({ state }: Props) => {
  const { formatMessage } = useIntl();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const email = state.email;
  if (!email) {
    return null;
  }

  return (
    <>
      <Box mb="24px">
        <Warning>
          {formatMessage(messages.emailAlreadyTaken, {
            email,
          })}
        </Warning>
        <Button
          width="auto"
          mt="32px"
          icon={status === 'success' ? 'check-circle' : 'email'}
          processing={status === 'loading'}
          disabled={status === 'success'}
          bgColor={status === 'success' ? colors.success : undefined}
          onClick={async () => {
            setStatus('loading');
            await resendInvite(email);
            setStatus('success');
          }}
        >
          {formatMessage(
            status === 'success'
              ? messages.invitationResent
              : messages.resendInvite
          )}
        </Button>
      </Box>
    </>
  );
};

export default InviteTaken;
