import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { State } from 'containers/Authentication/typings';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Invitation, { Props as InvitationProps } from '../Invitation';

import messages from './messages';

type Props = InvitationProps & {
  state: State;
};

const InvitationResent = ({ state, ...props }: Props) => {
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
      </Box>
      <Invitation {...props} />
    </>
  );
};

export default InvitationResent;
