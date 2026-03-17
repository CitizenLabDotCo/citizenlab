import React, { useEffect, useRef } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import refreshToken from 'api/authentication/sign_in_out/refreshToken';
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
  const location = useLocation();
  const isAuthenticated = !!authUser;
  const { sessionState, resetState, dismissModal } = useSessionExpiryMonitor(
    isAuthenticated,
    location.pathname
  );
  const { formatMessage } = useIntl();

  const isExpired = sessionState === 'expired';
  const previousTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionState === 'expiring_soon' || sessionState === 'expired') {
      if (previousTitleRef.current === null) {
        previousTitleRef.current = document.title;
      }
      document.title =
        sessionState === 'expiring_soon'
          ? 'Session expiring soon'
          : 'Signed out';
    }

    return () => {
      if (previousTitleRef.current !== null) {
        document.title = previousTitleRef.current;
        previousTitleRef.current = null;
      }
    };
  }, [sessionState]);

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

  const clearSession = async () => {
    removeJwt();
    await resetMeQuery();
    invalidateQueryCache();
  };

  const handleLogInAgain = () => {
    resetState();
    triggerAuthenticationFlow(undefined, 'signin');
  };

  const handleSignOut = async () => {
    await clearSession();
    resetState();
  };

  const handleClose = async () => {
    if (isExpired) {
      await clearSession();
      resetState();
    } else {
      dismissModal();
    }
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
        {isExpired ? (
          <Box display="flex" gap="12px">
            <Button onClick={handleLogInAgain}>
              {formatMessage(messages.logInAgain)}
            </Button>
            <Button buttonStyle="text" onClick={handleSignOut}>
              {formatMessage(messages.staySignedOut)}
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap="12px">
            <Button onClick={handleStayLoggedIn}>
              {formatMessage(messages.stayLoggedIn)}
            </Button>
            <Button buttonStyle="text" onClick={handleSignOut}>
              {formatMessage(messages.signOut)}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default SessionExpiryModal;
