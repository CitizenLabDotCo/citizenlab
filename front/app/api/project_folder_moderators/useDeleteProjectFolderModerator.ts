import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderModeratorsKeys from './keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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

      invalidateSeatsCache();

      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`],
      });
    },
  });
};

export default useDeleteProjectFolderModerator;
