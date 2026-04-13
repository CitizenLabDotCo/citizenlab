import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import { IUser } from 'api/users/types';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderModeratorsKeys from './keys';
import { ProjectFolderModeratorAdd } from './types';

const addModerator = async ({
  user_id,
  user_email,
  projectFolderId,
}: ProjectFolderModeratorAdd) =>
  fetcher<IUser>({
    path: `/project_folders/${projectFolderId}/moderators`,
    action: 'post',
    body: {
      moderator: {
        user_id,
        user_email,
      },
    },
  });

const useAddProjectFolderModerator = () => {
  const queryClient = useQueryClient();
  return useMutation<IUser, CLErrors, ProjectFolderModeratorAdd>({
    mutationFn: addModerator,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderModeratorsKeys.all(),
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

export default useAddProjectFolderModerator;
