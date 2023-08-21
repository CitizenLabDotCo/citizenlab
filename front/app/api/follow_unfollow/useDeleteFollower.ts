import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { FollowerDelete } from './types';
import { invalidateFollowQueries } from './utils';

const deleteFollower = ({ followerId }: FollowerDelete) =>
  fetcher({
    path: `/followers/${followerId}`,
    action: 'delete',
  });

const useDeleteFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFollower,
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

export default useDeleteFollow;
