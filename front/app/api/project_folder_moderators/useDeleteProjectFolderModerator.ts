import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from 'api/users/keys';

const deleteModerator = ({
  projectFolderId,
  id,
}: {
  projectFolderId: string;
  id: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}/moderators/${id}`,
    action: 'delete',
  });

const useDeleteProjectFolderModerator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModerator,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFolderModeratorsKeys.list({
          projectFolderId: variables.projectFolderId,
        }),
      });

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      invalidateSeatsCache();
    },
  });
};

export default useDeleteProjectFolderModerator;
