import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCommentsCountKeys from './keys';
import { UserUsersCountKeys, IUsersCount } from './types';

const fetchUserCount = () =>
  fetcher<IUsersCount>({
    path: `/stats/users_count`,
    action: 'get',
  });

const useUsersCount = () => {
  return useQuery<IUsersCount, CLErrors, IUsersCount, UserUsersCountKeys>({
    queryKey: userCommentsCountKeys.items(),
    queryFn: () => fetchUserCount(),
  });
};

export default useUsersCount;
