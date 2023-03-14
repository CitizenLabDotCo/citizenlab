import { useState, useEffect } from 'react';
import { IBlockedUsersCountData, blockedUsersCount } from 'services/users';

export default function useBlockedUsersCount() {
  const [count, setCount] = useState<
    IBlockedUsersCountData | undefined | null | Error
  >(undefined);
  useEffect(() => {
    const subscription = blockedUsersCount().observable.subscribe(
      (blockedUsersCountResponse) => {
        setCount(blockedUsersCountResponse.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return count;
}
