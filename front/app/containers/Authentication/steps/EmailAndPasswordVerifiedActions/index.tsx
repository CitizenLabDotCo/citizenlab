import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SetError } from 'containers/Authentication/typings';

import { useIntl } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';
import Form from '../EmailAndPassword/Form';

import messages from './messages';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
  onSwitchFlow: () => void;
  closeModal: () => void;
}

const EmailAndPasswordVerifiedActions = ({
  loading,
  setError,
  onSubmit,
  onSwitchFlow,
  closeModal,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box id="e2e-verified-actions-email-password-container">
      <Form
        loading={loading}
        setError={setError}
        onSubmit={onSubmit}
        closeModal={closeModal}
      />
      <Text mt="12px">
        <TextButton
          id="e2e-goto-sso-verfication"
          onClick={onSwitchFlow}
          className="link"
        >
          {formatMessage(messages.goBackToSSOVerification)}
        </TextButton>
      </Text>
    </Box>
  );
};

export default EmailAndPasswordVerifiedActions;
