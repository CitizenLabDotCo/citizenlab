import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SetError } from 'containers/Authentication/typings';

import { useIntl } from 'utils/cl-intl';

import authenticationMessages from '../../messages';
import EmailConfirmation from '../EmailConfirmation';

interface Props {
  email: string | null;
  loading: boolean;
  setError: SetError;
  onConfirm: (email: string, code: string) => void;
  onChangeEmail?: () => void;
  onResendCode: (email: string) => Promise<void>;
}

// The email the user supplied already belongs to another account. The code was
// sent to that account's inbox, and entering it merges this (email-less, SSO)
// account into that one. Code entry itself is identical to any other email
// confirmation, so only the explanation above it differs - the user is about to
// end up signed in as a different account, and needs to be told so before they
// type the code, not after.
const MergeAccountConfirmation = ({
  email,
  ...emailConfirmationProps
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Text mt="0px" mb="24px">
        {formatMessage(authenticationMessages.mergeAccountExplanation, {
          email: email ?? '',
        })}
      </Text>
      <EmailConfirmation email={email} {...emailConfirmationProps} />
    </Box>
  );
};

export default MergeAccountConfirmation;
