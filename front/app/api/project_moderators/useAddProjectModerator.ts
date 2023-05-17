import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsers } from 'api/users/types';
import { ProjectModeratorAdd } from './types';
import projectModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import usersKeys from 'api/users/keys';

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
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/stats/users_count`],
      });
    },
  });
};

export default useAddProjectModerator;
