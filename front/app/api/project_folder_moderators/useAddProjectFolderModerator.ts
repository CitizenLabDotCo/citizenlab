import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';
import { IUsers } from 'api/users/types';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectFolderModeratorsKeys from './keys';
import { ProjectFolderModeratorAdd } from './types';

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
