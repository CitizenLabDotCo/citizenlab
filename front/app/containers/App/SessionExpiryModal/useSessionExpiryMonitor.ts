import { useState, useEffect, useCallback, useRef } from 'react';

import { API_PATH } from 'containers/App/constants';

import clHistory from 'utils/cl-router/history';

type SessionState = 'idle' | 'expiring_soon' | 'expired';

const CHECK_INTERVAL_S = 300; // Checks session valid every 5 minutes unless the route is changed
const EXPIRING_SOON_THRESHOLD_S = 1800; // Show expiring soon 30 minutes before expiry
const DISMISSED_RESHOW_THRESHOLD_S = 320; // If dismissed re-show expiring soon just over 5 mins before expiry

type PingResult =
  | { status: 'valid'; expiresAt: number | null }
  | { status: 'expired' }
  | { status: 'not_admin' };

// The auth token is in an HttpOnly cookie we can't read, so the API tells us when
// it expires (in seconds since the epoch).
async function readExpiresAt(response: Response): Promise<number | null> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'expires_at' in body &&
      typeof body.expires_at === 'number'
    ) {
      return body.expires_at;
    }
  } catch {
    // No JSON body: we don't know when the session expires
  }
  return null;
}

async function checkSessionOnServer(
  isAdminRoute: boolean
): Promise<PingResult> {
  const adminParam = isAdminRoute ? '?admin=true' : '';

  try {
    const response = await fetch(`${API_PATH}/users/me/ping${adminParam}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 401) return { status: 'expired' };
    if (response.status === 403) return { status: 'not_admin' };
    return { status: 'valid', expiresAt: await readExpiresAt(response) };
  } catch {
    // Network error — don't treat as logged out
    return { status: 'valid', expiresAt: null };
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
  const dismissedExpiringSoonRef = useRef(false);
  const lastExpRef = useRef<number | null>(null);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const resetState = useCallback(() => {
    dismissedRef.current = true;
    setSessionState('idle');
  }, []);

  // Hides the modal but keeps the monitor running.
  // It won't re-appear until DISMISSED_RESHOW_THRESHOLD_S before expiry.
  const dismissModal = useCallback(() => {
    dismissedExpiringSoonRef.current = true;
    setSessionState('idle');
  }, []);

  // Reset state when user goes from not-authenticated to authenticated
  // (i.e. they logged back in after session expired)
  useEffect(() => {
    if (!wasAuthenticatedRef.current && isAuthenticated) {
      dismissedRef.current = false;
      dismissedExpiringSoonRef.current = false;
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
        const isAdminRoute = pathname.startsWith('/admin');
        const ping = await checkSessionOnServer(isAdminRoute);
        const expiresAt = ping.status === 'valid' ? ping.expiresAt : null;

        // Detect if the token has been refreshed (new login) since we dismissed
        if (expiresAt !== null) {
          if (lastExpRef.current !== null && expiresAt > lastExpRef.current) {
            // Token was replaced with a newer one — user logged back in
            dismissedRef.current = false;
            dismissedExpiringSoonRef.current = false;
            setSessionState('idle');
          }
          lastExpRef.current = expiresAt;
        }

        if (dismissedRef.current) return;

        if (ping.status === 'not_admin') {
          // User is authenticated but lacks admin/moderator access
          clHistory.push('/');
          return;
        }
        if (ping.status === 'expired') {
          setSessionState('expired');
          return;
        }
        if (expiresAt === null) return;

        const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);

        if (secondsLeft <= EXPIRING_SOON_THRESHOLD_S) {
          const threshold = dismissedExpiringSoonRef.current
            ? DISMISSED_RESHOW_THRESHOLD_S
            : EXPIRING_SOON_THRESHOLD_S;

          if (secondsLeft <= threshold) {
            dismissedExpiringSoonRef.current = false;
            setInitialSecondsRemaining(Math.max(0, Math.floor(secondsLeft)));
            setSessionState('expiring_soon');
          }
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
