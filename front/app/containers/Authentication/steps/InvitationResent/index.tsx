import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { State } from 'containers/Authentication/typings';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  state: State;
};

const InvitationResent = ({ state }: Props) => {
  const { formatMessage } = useIntl();

  if (!state.email) return null;

  return (
    <>
      <Box mb="24px">
        <Warning>
          {formatMessage(messages.emailAlreadyTaken, {
            email: state.email,
          })}
        </Warning>
        <Button width="auto" mt="32px" icon="email">
          {formatMessage(messages.resendInvite)}
        </Button>
      </Box>
    </>
  );
};

export default InvitationResent;
