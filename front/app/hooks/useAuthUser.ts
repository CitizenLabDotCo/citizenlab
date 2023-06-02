import { useState, useEffect } from 'react';
import { authUserStream } from 'services/auth';
import { IUserData } from 'api/users/types';

export type TAuthUser = IUserData | undefined | null | Error;

export default function useAuthUser() {
  const [authUser, setAuthUser] = useState<TAuthUser>(undefined);

  useEffect(() => {
    const subscription = authUserStream().observable.subscribe(
      (currentAuthUser) => {
        setAuthUser(currentAuthUser?.data || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return authUser;
}
