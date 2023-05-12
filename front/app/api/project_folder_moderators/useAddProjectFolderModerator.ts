import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUsers } from 'services/users';
import { ProjectFolderModeratorAdd } from './types';
import projectFolderModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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
      invalidateSeatsCache();
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`, `${API_PATH}/stats/users_count`],
      });
    },
  });
};

export default useAddProjectFolderModerator;
