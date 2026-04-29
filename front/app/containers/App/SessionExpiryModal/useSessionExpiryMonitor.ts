import { useState, useEffect, useCallback, useRef } from 'react';

import { API_PATH } from 'containers/App/constants';

import { getJwt, getSecondsUntilExpiry } from 'utils/auth/jwt';

type SessionState = 'idle' | 'expiring_soon' | 'expired';

const CHECK_INTERVAL_S = 300; // Checks every 5 minutes unless the route is changed
const EXPIRING_SOON_THRESHOLD_S = 1800; // 30 minutes

type PingResult = 'valid' | 'expired' | 'not_admin';

async function checkSessionOnServer(
  isAdminRoute: boolean
): Promise<PingResult> {
  const jwt = getJwt();
  if (!jwt) return 'expired';

  const adminParam = isAdminRoute ? '?admin=true' : '';

  try {
    const response = await fetch(`${API_PATH}/users/me/ping${adminParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (response.status === 401) return 'expired';
    if (response.status === 403) return 'not_admin';
    return 'valid';
  } catch {
    // Network error — don't treat as logged out
    return 'valid';
  }
}

export default function useSessionExpiryMonitor(
  isAuthenticated: boolean,
  pathname: string
) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [initialSecondsRemaining, setInitialSecondsRemaining] = useState<
    number | null
  >(null);
  const checkingRef = useRef(false);
  const dismissedRef = useRef(false);
  const lastExpRef = useRef<number | null>(null);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const resetState = useCallback(() => {
    dismissedRef.current = true;
    setSessionState('idle');
  }, []);

  // Hides the modal but keeps the monitor running
  const dismissModal = useCallback(() => {
    setSessionState('idle');
  }, []);

  // Reset state when user goes from not-authenticated to authenticated
  // (i.e. they logged back in after session expired)
  useEffect(() => {
    if (!wasAuthenticatedRef.current && isAuthenticated) {
      dismissedRef.current = false;
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

      // Detect if the JWT has been refreshed (new login) since we dismissed
      const secondsUntilExpiry = getSecondsUntilExpiry();
      if (secondsUntilExpiry !== null) {
        const currentExp = Math.floor(Date.now() / 1000) + secondsUntilExpiry;
        if (lastExpRef.current !== null && currentExp > lastExpRef.current) {
          // JWT was replaced with a newer one — user logged back in
          dismissedRef.current = false;
          setSessionState('idle');
        }
        lastExpRef.current = currentExp;
      }

      if (dismissedRef.current) return;
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
        const isAdminRoute = pathname.startsWith('/admin');
        const pingResult = await checkSessionOnServer(isAdminRoute);
        if (pingResult === 'not_admin') {
          // User is authenticated but lacks admin/moderator access
          window.location.replace('/');
          return;
        }
        if (pingResult === 'expired') {
          setSessionState('expired');
          return;
        }

        if (secondsLeft !== null && secondsLeft <= EXPIRING_SOON_THRESHOLD_S) {
          setInitialSecondsRemaining(Math.max(0, Math.floor(secondsLeft)));
          setSessionState('expiring_soon');
        }
      } finally {
        checkingRef.current = false;
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_S * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, pathname]);

  return { sessionState, initialSecondsRemaining, resetState, dismissModal };
}
