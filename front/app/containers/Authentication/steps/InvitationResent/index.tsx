import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Invitation, { Props } from '../Invitation';

import messages from './messages';

const InvitationResent = (props: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box mb="24px">
        <Warning>
          {formatMessage(messages.emailAlreadyTaken, {
            email: 'your@email.com',
          })}
        </Warning>
      </Box>
      <Invitation {...props} />
    </>
  );
};

export default InvitationResent;
