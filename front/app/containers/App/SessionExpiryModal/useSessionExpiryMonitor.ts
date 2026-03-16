import { useState, useEffect, useCallback, useRef } from 'react';

import { API_PATH } from 'containers/App/constants';

import { getJwt, getSecondsUntilExpiry } from 'utils/auth/jwt';

type SessionState = 'idle' | 'expiring_soon' | 'expired';

const CHECK_INTERVAL_MS = 60_000;
const EXPIRING_SOON_THRESHOLD_S = 1800; // 30 minutes

async function isSessionInvalidOnServer(): Promise<boolean> {
  const jwt = getJwt();
  if (!jwt) return true;

  try {
    const response = await fetch(`${API_PATH}/users/me/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.status === 401;
  } catch {
    // Network error — don't treat as logged out
    return false;
  }
}

export default function useSessionExpiryMonitor(isAuthenticated: boolean) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const checkingRef = useRef(false);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const resetState = useCallback(() => {
    setSessionState('idle');
  }, []);

  // Reset state when user goes from not-authenticated to authenticated
  // (i.e. they logged back in after session expired)
  useEffect(() => {
    if (!wasAuthenticatedRef.current && isAuthenticated) {
      setSessionState('idle');
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const check = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const secondsLeft = getSecondsUntilExpiry();

        // JWT clearly expired locally — no need to check server
        if (secondsLeft !== null && secondsLeft <= 0) {
          setSessionState('expired');
          return;
        }

        // For all other cases (expiring soon, looks fine, or cookie missing),
        // verify against the server before deciding state
        const invalidOnServer = await isSessionInvalidOnServer();
        if (invalidOnServer) {
          setSessionState('expired');
          return;
        }

        if (secondsLeft !== null && secondsLeft <= EXPIRING_SOON_THRESHOLD_S) {
          setSessionState('expiring_soon');
        }
      } finally {
        checkingRef.current = false;
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  return { sessionState, resetState };
}
