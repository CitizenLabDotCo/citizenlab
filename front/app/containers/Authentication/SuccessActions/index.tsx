import React, { useState, useEffect } from 'react';

import { BehaviorSubject } from 'rxjs';

import authUserStream from 'api/me/authUserStream';
import { IUserData } from 'api/users/types';

import FullPageSpinner from 'components/UI/FullPageSpinner';

import { getAction, SuccessAction } from './actions';

const successAction$ = new BehaviorSubject<SuccessAction | null>(null);

export const triggerSuccessAction = (successAction: SuccessAction) => {
  successAction$.next(successAction);
};

/** How long to wait for the auth user before giving up on a queued action. */
const AUTH_USER_TIMEOUT = 10000;

const getAuthUser = () => {
  let streamSubscription;

  const promise = new Promise<IUserData>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for the authenticated user'));
    }, AUTH_USER_TIMEOUT);

    streamSubscription = authUserStream.subscribe((response) => {
      // Both undefined (not loaded yet) and null (the me query still reporting
      // signed out) mean "not ready yet" here, not "signed out for good". The
      // caller consumes the queued action before awaiting this promise, so
      // rejecting discards that action permanently rather than deferring it —
      // which silently dropped post-sign-in redirects whenever the stream had
      // not caught up with the sign-in yet. Wait for a real user instead; the
      // timeout stops a genuinely signed-out state from hanging forever.
      if (!response) return;

      clearTimeout(timeout);
      resolve(response.data);
    });
  });

  return { promise, streamSubscription };
};

const SuccessActions = () => {
  const [showFullPageSpinner, setShowFullPageSpinner] = useState(false);

  useEffect(() => {
    const subscription = successAction$.subscribe((successAction) => {
      if (successAction === null) return;
      setShowFullPageSpinner(true);

      const action = getAction(successAction);
      successAction$.next(null);

      const { promise, streamSubscription } = getAuthUser();

      promise
        .then(async (authUser) => {
          await action(authUser);
        })
        .catch(() => {
          console.error('Failed to fetch authUser');
        })
        .finally(() => {
          setShowFullPageSpinner(false);
          streamSubscription.unsubscribe();
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (showFullPageSpinner) {
    return <FullPageSpinner zIndex={10000} background />;
  }

  return <></>;
};

export default SuccessActions;
