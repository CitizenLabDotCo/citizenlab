import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsers } from 'api/users/types';
import { ProjectFolderModeratorAdd } from './types';
import projectFolderModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import userCountKeys from 'api/users_count/keys';

const addModerator = async ({
  moderatorId,
  projectFolderId,
}: ProjectFolderModeratorAdd) =>
  fetcher<IUsers>({
    path: `/project_folders/${projectFolderId}/moderators`,
    action: 'post',
    body: {
      project_folder_moderator: {
        user_id: moderatorId,
      },
    },
  });

const useAddProjectFolderModerator = () => {
  const queryClient = useQueryClient();
  return useMutation<IUsers, CLErrors, ProjectFolderModeratorAdd>({
    mutationFn: addModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderModeratorsKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      invalidateSeatsCache();
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
    },
  });
};

export default useAddProjectFolderModerator;
