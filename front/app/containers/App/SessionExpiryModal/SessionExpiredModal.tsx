import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useDocumentTitle from './useDocumentTitle';

interface Props {
  onClearSession: () => Promise<void>;
  onResetState: () => void;
}

const SessionExpiredModal = ({ onClearSession, onResetState }: Props) => {
  const { formatMessage } = useIntl();
  useDocumentTitle(formatMessage(messages.tabTitleSignedOut));

  const handleSignInAgain = () => {
    onResetState();
    triggerAuthenticationFlow(undefined, 'signin');
  };

  const handleStaySignedOut = async () => {
    await onClearSession();
    onResetState();
  };

  return (
    <Modal
      opened
      close={handleStaySignedOut}
      ariaLabelledBy="session-expiry-modal-title"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        p="32px"
        gap="16px"
      >
        <Title variant="h2" textAlign="center" id="session-expiry-modal-title">
          {formatMessage(messages.sessionExpiredTitle)}
        </Title>
        <Text textAlign="center" color="textSecondary">
          {formatMessage(messages.sessionExpiredDescription)}
        </Text>
        <Box display="flex" gap="12px">
          <Button buttonStyle="text" onClick={handleStaySignedOut}>
            {formatMessage(messages.staySignedOut)}
          </Button>
          <Button onClick={handleSignInAgain}>
            {formatMessage(messages.signInAgain)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SessionExpiredModal;
