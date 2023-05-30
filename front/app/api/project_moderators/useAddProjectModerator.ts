import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsers } from 'api/users/types';
import { ProjectModeratorAdd } from './types';
import projectModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import userCountKeys from 'api/users_count/keys';

const addModerator = async ({ moderatorId, projectId }: ProjectModeratorAdd) =>
  fetcher<IUsers>({
    path: `/projects/${projectId}/moderators`,
    action: 'post',
    body: {
      moderator: {
        user_id: moderatorId,
      },
    },
  });

const useAddProjectModerator = () => {
  const queryClient = useQueryClient();
  return useMutation<IUsers, CLErrors, ProjectModeratorAdd>({
    mutationFn: addModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectModeratorsKeys.list({
          projectId: variables.projectId,
        }),
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      invalidateSeatsCache();

      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useAddProjectModerator;
