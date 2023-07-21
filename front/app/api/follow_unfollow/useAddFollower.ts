import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import followUnfollowKeys from './keys';
import projectsKeys from 'api/projects/keys';
import { FollowerAdd, IFollower } from './types';

const addFollower = async ({ followableType, followableId }: FollowerAdd) =>
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
      queryClient.invalidateQueries({ queryKey: followUnfollowKeys.all() });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: variables.followableId }),
      });
    },
  });
};

export default useAddFollower;
