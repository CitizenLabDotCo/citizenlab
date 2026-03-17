import React, { useEffect, useRef, useState } from 'react';

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
  const { sessionState, initialSecondsRemaining, resetState, dismissModal } =
    useSessionExpiryMonitor(isAuthenticated, location.pathname);
  const { formatMessage } = useIntl();

  const isExpired = sessionState === 'expired';
  const [countdown, setCountdown] = useState<number>(0);
  const previousTitleRef = useRef<string | null>(null);

  // Countdown timer for expiring_soon state
  useEffect(() => {
    if (sessionState !== 'expiring_soon' || initialSecondsRemaining === null) {
      return;
    }

    setCountdown(initialSecondsRemaining);

    const id = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [sessionState, initialSecondsRemaining]);

  useEffect(() => {
    if (sessionState === 'expiring_soon' || sessionState === 'expired') {
      if (previousTitleRef.current === null) {
        previousTitleRef.current = document.title;
      }
      document.title = formatMessage(
        sessionState === 'expiring_soon'
          ? messages.tabTitleExpiringSoon
          : messages.tabTitleSignedOut
      );
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
          {isExpired
            ? formatMessage(messages.sessionExpiredDescription)
            : countdown <= 60
            ? formatMessage(messages.sessionExpiringSoonDescriptionSeconds, {
                seconds: countdown,
              })
            : formatMessage(messages.sessionExpiringSoonDescriptionMinutes, {
                minutes: Math.ceil(countdown / 60),
              })}
        </Text>
        {isExpired ? (
          <Box display="flex" gap="12px">
            <Button buttonStyle="text" onClick={handleSignOut}>
              {formatMessage(messages.staySignedOut)}
            </Button>
            <Button onClick={handleLogInAgain}>
              {formatMessage(messages.logInAgain)}
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap="12px">
            <Button buttonStyle="text" onClick={handleSignOut}>
              {formatMessage(messages.signOut)}
            </Button>
            <Button onClick={handleStayLoggedIn}>
              {formatMessage(messages.stayLoggedIn)}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default SessionExpiryModal;
