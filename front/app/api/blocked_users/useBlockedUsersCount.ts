import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesCountKeys from './keys';
import { BlockedUsersCountKeys, IBlockedUsersCount } from './types';

const fetchBlockedUsersCount = () =>
  fetcher<IBlockedUsersCount>({
    path: `/users/blocked_count`,
    action: 'get',
  });

const useBlockedUsersCount = () => {
  return useQuery<
    IBlockedUsersCount,
    CLErrors,
    IBlockedUsersCount,
    BlockedUsersCountKeys
  >({
    queryKey: initiativesCountKeys.items(),
    queryFn: () => fetchBlockedUsersCount(),
  });
};

export default useBlockedUsersCount;
