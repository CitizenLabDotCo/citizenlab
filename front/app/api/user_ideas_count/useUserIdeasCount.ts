import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userIdeasCountKeys from './keys';
import { UserIdeaCountKeys, IParameters, IIdeaCount } from './types';

const fetchUserIdeaCount = ({ userId }: IParameters) =>
  fetcher<IIdeaCount>({
    path: `/users/${userId}/ideas_count`,
    action: 'get',
  });

const useUserIdeaCount = ({ userId }: IParameters) => {
  return useQuery<IIdeaCount, CLErrors, IIdeaCount, UserIdeaCountKeys>({
    queryKey: userIdeasCountKeys.item({ userId }),
    queryFn: () => fetchUserIdeaCount({ userId }),
    enabled: !!userId,
  });
};

export default useUserIdeaCount;
