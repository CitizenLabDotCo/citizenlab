import { useState, useEffect } from 'react';
import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';

export default function useAuthUser() {
  const [authUser, setAuthUser] = useState<IUser | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const subscription = authUserStream().observable.subscribe(
      (currentAuthUser) => {
        setAuthUser(currentAuthUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return authUser;
}
