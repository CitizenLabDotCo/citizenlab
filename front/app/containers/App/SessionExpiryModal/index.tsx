import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import refreshToken from 'api/authentication/sign_in_out/refreshToken';
import signOut from 'api/authentication/sign_in_out/signOut';
import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Modal from 'components/UI/Modal';

import { removeJwt } from 'utils/auth/jwt';
import { useIntl } from 'utils/cl-intl';
import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';

import messages from './messages';
import useSessionExpiryMonitor from './useSessionExpiryMonitor';

const SessionExpiryModal = () => {
  const { data: authUser } = useAuthUser();
  const isAuthenticated = !!authUser;
  const { sessionState, resetState } = useSessionExpiryMonitor(isAuthenticated);
  const { formatMessage } = useIntl();

  const isExpired = sessionState === 'expired';

  if (sessionState === 'idle') return null;

  const handleStayLoggedIn = async () => {
    try {
      await refreshToken();
      resetState();
    } catch {
      // Refresh failed — treat as expired
      handleLogInAgain();
    }
  };

  const handleLogInAgain = async () => {
    await signOut();
    triggerAuthenticationFlow(undefined, 'signin');
  };

  const handleClose = async () => {
    if (isExpired) {
      removeJwt();
      await resetMeQuery();
      invalidateQueryCache();
    }
    resetState();
  };

  return (
    <Modal
      opened
      close={handleClose}
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
          {formatMessage(
            isExpired
              ? messages.sessionExpiredTitle
              : messages.sessionExpiringSoonTitle
          )}
        </Title>
        <Text textAlign="center" color="textSecondary">
          {formatMessage(
            isExpired
              ? messages.sessionExpiredDescription
              : messages.sessionExpiringSoonDescription
          )}
        </Text>
        <Button onClick={isExpired ? handleLogInAgain : handleStayLoggedIn}>
          {formatMessage(
            isExpired ? messages.logInAgain : messages.stayLoggedIn
          )}
        </Button>
      </Box>
    </Modal>
  );
};

export default SessionExpiryModal;
