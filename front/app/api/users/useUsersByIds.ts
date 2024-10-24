import { UseQueryOptions, useQueries } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';
import { IUser } from './types';

type UsersWithIdsReturnType = UseQueryOptions<IUser>[];

export const fetchUser = (id: string) => {
  return fetcher<IUser>({
    path: `/users/${id}`,
    action: 'get',
  });
};

/**
 * Fetches users by their ids one by one (careful with performance implications)
 * @param userIds - Array of user ids
 * @returns Array of useQuery hooks
 */

const useUsersWithIds = (userIds?: string[]) => {
  const queries = userIds
    ? userIds.map((userId) => ({
        queryKey: usersKeys.item({ id: userId }),
        queryFn: () => fetchUser(userId),
      }))
    : [];
  return useQueries<UsersWithIdsReturnType>({
    queries,
  });
};

export default useUsersWithIds;
