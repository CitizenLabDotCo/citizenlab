import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderKeys from './keys';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import projectsKeys from 'api/projects/keys';

const deleteProjectFolder = ({
  projectFolderId,
}: {
  projectFolderId: string;
}) =>
  fetcher({
    path: `/project_folders/${projectFolderId}`,
    action: 'delete',
  });

const useDeleteProjectFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFolder,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: projectFolderKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.lists(),
      });
      await streams.fetchAllWith({
        partialApiEndpoint: [`${API_PATH}/admin_publications`],
      });
    },
  });
};

export default useDeleteProjectFolder;
