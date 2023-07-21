import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import followUnfollowKeys from './keys';
import projectsKeys from 'api/projects/keys';
import { FollowerDelete } from './types';

const deleteFollower = ({ followerId }: FollowerDelete) =>
  fetcher({
    path: `/followers/${followerId}`,
    action: 'delete',
  });

const useDeleteFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFollower,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: followUnfollowKeys.all(),
      });

      if (variables.followableType === 'projects') {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: variables.followableId }),
        });
      }
    },
  });
};

export default useDeleteFollow;
