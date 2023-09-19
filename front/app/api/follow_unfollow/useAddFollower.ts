import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { FollowerAdd, IFollower } from './types';
import { invalidateFollowQueries } from './utils';

export const addFollower = async ({
  followableType,
  followableId,
}: FollowerAdd) =>
  fetcher<IFollower>({
    path: `/${followableType}/${followableId}/followers`,
    action: 'post',
    body: {},
  });

const useAddFollower = () => {
  const queryClient = useQueryClient();
  return useMutation<IFollower, CLErrors, FollowerAdd>({
    mutationFn: addFollower,
    onSuccess: async (_data, variables) => {
      invalidateFollowQueries(
        queryClient,
        variables.followableType,
        variables.followableId,
        variables.followableSlug
      );
    },
  });
};

export default useAddFollower;
