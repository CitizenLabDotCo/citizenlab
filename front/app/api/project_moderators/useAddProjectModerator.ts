import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import { IUsers } from 'api/users/types';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectModeratorsKeys from './keys';
import { ProjectModeratorAdd } from './types';

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
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useAddProjectModerator;
