import React, { useEffect, useState } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useDocumentTitle from './useDocumentTitle';

interface Props {
  initialSecondsRemaining: number;
  onDismiss: () => void;
  onClearSession: () => Promise<void>;
  onResetState: () => void;
}

const SessionExpiringSoonModal = ({
  initialSecondsRemaining,
  onDismiss,
  onClearSession,
  onResetState,
}: Props) => {
  const { formatMessage } = useIntl();
  useDocumentTitle(formatMessage(messages.tabTitleExpiringSoon));
  const [countdown, setCountdown] = useState(initialSecondsRemaining);

  useEffect(() => {
    setCountdown(initialSecondsRemaining);

    const id = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [initialSecondsRemaining]);

  const handleSignInAgain = async () => {
    await onClearSession();
    onResetState();
    triggerAuthenticationFlow(undefined, 'signin');
  };

  const handleSignOut = async () => {
    await onClearSession();
    onResetState();
  };

  return (
    <Modal opened close={onDismiss} ariaLabelledBy="session-expiry-modal-title">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        p="32px"
        gap="16px"
      >
        <Title variant="h2" textAlign="center" id="session-expiry-modal-title">
          {formatMessage(messages.sessionExpiringSoonTitle)}
        </Title>
        <Text textAlign="center" color="textSecondary">
          {countdown <= 60
            ? formatMessage(messages.sessionExpiringSoonDescriptionSeconds, {
                seconds: countdown,
              })
            : formatMessage(messages.sessionExpiringSoonDescriptionMinutes, {
                minutes: Math.ceil(countdown / 60),
              })}
        </Text>
        <Box display="flex" gap="12px">
          <Button buttonStyle="text" onClick={handleSignOut}>
            {formatMessage(messages.signOut)}
          </Button>
          <Button onClick={handleSignInAgain}>
            {formatMessage(messages.signInAgain)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SessionExpiringSoonModal;
