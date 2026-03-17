import React, { useCallback } from 'react';

import { useLocation } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import { removeJwt } from 'utils/auth/jwt';
import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';

import SessionExpiredModal from './SessionExpiredModal';
import SessionExpiringSoonModal from './SessionExpiringSoonModal';
import useSessionExpiryMonitor from './useSessionExpiryMonitor';

const SessionExpiryModal = () => {
  const { data: authUser } = useAuthUser();
  const location = useLocation();
  const isAuthenticated = !!authUser;
  const { sessionState, initialSecondsRemaining, resetState, dismissModal } =
    useSessionExpiryMonitor(isAuthenticated, location.pathname);

  // Used to log out the user after session expires
  // or when they click "Sign out now" in the expiring soon modal
  const clearSession = useCallback(async () => {
    removeJwt();
    await resetMeQuery();
    invalidateQueryCache();
  }, []);

  if (sessionState === 'idle') return null;

  if (sessionState === 'expiring_soon') {
    return (
      <SessionExpiringSoonModal
        initialSecondsRemaining={initialSecondsRemaining ?? 0}
        onDismiss={dismissModal}
        onClearSession={clearSession}
        onResetState={resetState}
      />
    );
  }

  return (
    <SessionExpiredModal
      onClearSession={clearSession}
      onResetState={resetState}
    />
  );
};

export default SessionExpiryModal;
