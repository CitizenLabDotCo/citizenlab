import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import {
  IUser,
  IUserData,
  userByIdStream,
  userBySlugStream,
} from 'services/users';
import { isNilOrError } from 'utils/helperUtils';

interface Params {
  userId?: string | null;
  slug?: string | null;
}

export default function useUser({ userId, slug }: Params) {
  const [user, setUser] = useState<IUserData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setUser(undefined);

    let observable: Observable<IUser | null> = of(null);

    if (userId) {
      observable = userByIdStream(userId).observable;
    } else if (slug) {
      observable = userBySlugStream(slug).observable;
    }

    const subscription = observable.subscribe((response) => {
      const userResponse = !isNilOrError(response) ? response.data : response;
      setUser(userResponse);
    });

    return () => subscription.unsubscribe();
  }, [userId, slug]);

  return user;
}
