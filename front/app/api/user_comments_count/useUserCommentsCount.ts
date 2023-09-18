import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCommentsCountKeys from './keys';
import { UserCommentsCountKeys, IParameters, ICommentsCount } from './types';

const fetchUserCommentsCount = ({ userId }: IParameters) =>
  fetcher<ICommentsCount>({
    path: `/users/${userId}/comments_count`,
    action: 'get',
  });

const useUserCommentsCount = ({ userId }: IParameters) => {
  return useQuery<
    ICommentsCount,
    CLErrors,
    ICommentsCount,
    UserCommentsCountKeys
  >({
    queryKey: userCommentsCountKeys.item({ userId }),
    queryFn: () => fetchUserCommentsCount({ userId }),
    enabled: !!userId,
  });
};

export default useUserCommentsCount;
