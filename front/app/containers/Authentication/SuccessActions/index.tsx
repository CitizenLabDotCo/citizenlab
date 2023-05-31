import React, { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { getAction, SuccessAction } from './actions';
import { authUserStream } from 'services/auth';
import { IUserData } from 'api/users/types';

const successAction$ = new BehaviorSubject<SuccessAction | null>(null);

export const triggerSuccessAction = (successAction: SuccessAction) => {
  successAction$.next(successAction);
};

const getAuthUser = () => {
  let streamSubscription;

  const promise = new Promise<IUserData>((resolve, reject) => {
    streamSubscription = authUserStream().observable.subscribe((response) => {
      if (response === undefined) return;
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
  useEffect(() => {
    const subscription = successAction$.subscribe((successAction) => {
      if (successAction === null) return;

      const action = getAction(successAction);
      successAction$.next(null);

      const { promise, streamSubscription } = getAuthUser();

      promise
        .then((authUser) => {
          action(authUser);
        })
        .catch(() => {
          console.error('Failed to fetch authUser');
        })
        .finally(() => {
          streamSubscription.unsubscribe();
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <></>;
};

export default SuccessActions;
