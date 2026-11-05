import React, { ReactNode } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useDocumentTitle from './useDocumentTitle';

interface Props {
  tabTitle: string;
  title: string;
  description: ReactNode;
  dismissButtonLabel: string;
  onClose: () => void;
  onClearSession: () => Promise<void>;
  onResetState: () => void;
}

const SessionExpiryModalBase = ({
  tabTitle,
  title,
  description,
  dismissButtonLabel,
  onClose,
  onClearSession,
  onResetState,
}: Props) => {
  const { formatMessage } = useIntl();
  useDocumentTitle(tabTitle);

  const handleSignInAgain = () => {
    onResetState();
    triggerAuthenticationFlow(undefined, 'signin');
  };

  const handleDismiss = async () => {
    await onClearSession();
    onResetState();
  };

  return (
    <Modal opened close={onClose} ariaLabelledBy="session-expiry-modal-title">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        p="32px"
        gap="16px"
      >
        <Title variant="h2" textAlign="center" id="session-expiry-modal-title">
          {title}
        </Title>
        <Text textAlign="center" color="textSecondary">
          {description}
        </Text>
        <Box display="flex" gap="12px">
          <Button buttonStyle="text" onClick={handleDismiss}>
            {dismissButtonLabel}
          </Button>
          <Button onClick={handleSignInAgain}>
            {formatMessage(messages.signInAgain)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SessionExpiryModalBase;
