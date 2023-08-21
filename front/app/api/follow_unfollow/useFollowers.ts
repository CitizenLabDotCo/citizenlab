import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import followUnfollowKeys from './keys';
import { FollowUnfollowKeys, IFollowers, IParameters } from './types';

const fetchFollowers = async ({ followableObject }: IParameters) =>
  fetcher<IFollowers>({
    path: `/followers`,
    action: 'get',
    queryParams: { followable_type: followableObject },
  });

const useFollowers = (parameters: IParameters) => {
  return useQuery<IFollowers, CLErrors, IFollowers, FollowUnfollowKeys>({
    queryKey: followUnfollowKeys.list(parameters),
    queryFn: () => fetchFollowers(parameters),
  });
};

export default useFollowers;
