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

const getAuthUser = () => {
  let streamSubscription;

  const promise = new Promise<IUserData>((resolve, reject) => {
    streamSubscription = authUserStream.subscribe((response) => {
      if (response === undefined) return;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (response === null) {
        reject();
        return;
      }

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
