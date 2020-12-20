import { useState, useEffect } from 'react';
import { authUserStream } from 'services/auth';
import { IUserData } from 'services/users';

export default function useAuthUser() {
  const [authUser, setAuthUser] = useState<
    IUserData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = authUserStream().observable.subscribe(
      (currentAuthUser) => {
        setAuthUser(currentAuthUser?.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return authUser;
}
